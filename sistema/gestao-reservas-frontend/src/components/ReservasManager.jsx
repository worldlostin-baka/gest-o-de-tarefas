import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Edit, Trash2, Calendar, Clock, MapPin, User } from 'lucide-react'

const ReservasManager = ({ user, onStatsUpdate }) => {
  const [reservas, setReservas] = useState([])
  const [salas, setSalas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingReserva, setEditingReserva] = useState(null)
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    sala_id: ''
  })

  useEffect(() => {
    loadReservas()
    loadSalas()
  }, [])

  const loadReservas = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/reservas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setReservas(data.reservas || [])
        if (onStatsUpdate) onStatsUpdate()
      } else {
        setError('Erro ao carregar reservas')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const loadSalas = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/salas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSalas(data.salas || [])
      }
    } catch (err) {
      console.error('Erro ao carregar salas:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      
      // Validar datas
      const dataInicio = new Date(formData.data_inicio)
      const dataFim = new Date(formData.data_fim)
      
      if (dataInicio >= dataFim) {
        setError('Data de início deve ser anterior à data de fim')
        setLoading(false)
        return
      }

      const payload = {
        ...formData,
        sala_id: parseInt(formData.sala_id)
      }

      const url = editingReserva ? `/api/reservas/${editingReserva.id}` : '/api/reservas'
      const method = editingReserva ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok) {
        await loadReservas()
        setDialogOpen(false)
        resetForm()
      } else {
        setError(data.message || 'Erro ao salvar reserva')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (reserva) => {
    setEditingReserva(reserva)
    
    // Converter datas para formato do input datetime-local
    const dataInicio = new Date(reserva.data_inicio)
    const dataFim = new Date(reserva.data_fim)
    
    setFormData({
      titulo: reserva.titulo,
      descricao: reserva.descricao || '',
      data_inicio: dataInicio.toISOString().slice(0, 16),
      data_fim: dataFim.toISOString().slice(0, 16),
      sala_id: reserva.sala_id.toString()
    })
    setDialogOpen(true)
  }

  const handleCancel = async (reserva) => {
    if (!confirm(`Tem certeza que deseja cancelar a reserva "${reserva.titulo}"?`)) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/reservas/${reserva.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await loadReservas()
      } else {
        const data = await response.json()
        setError(data.message || 'Erro ao cancelar reserva')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      data_inicio: '',
      data_fim: '',
      sala_id: ''
    })
    setEditingReserva(null)
    setError('')
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getStatusBadge = (status) => {
    const variants = {
      'confirmada': 'default',
      'cancelada': 'destructive',
      'pendente': 'secondary'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {user.nivel_acesso === 'admin' ? 'Todas as Reservas' : 'Minhas Reservas'}
          </h2>
          <p className="text-gray-600">
            {user.nivel_acesso === 'admin' 
              ? 'Gerencie todas as reservas do sistema' 
              : 'Gerencie suas reservas de salas'
            }
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Reserva
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingReserva ? 'Editar Reserva' : 'Nova Reserva'}
              </DialogTitle>
              <DialogDescription>
                {editingReserva ? 'Edite as informações da reserva' : 'Crie uma nova reserva de sala'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Ex: Reunião de equipe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sala_id">Sala</Label>
                <Select value={formData.sala_id} onValueChange={(value) => setFormData({...formData, sala_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma sala" />
                  </SelectTrigger>
                  <SelectContent>
                    {salas.map(sala => (
                      <SelectItem key={sala.id} value={sala.id.toString()}>
                        {sala.nome} - {sala.tipo} (Cap: {sala.capacidade})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data e Hora de Início</Label>
                <Input
                  id="data_inicio"
                  name="data_inicio"
                  type="datetime-local"
                  value={formData.data_inicio}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_fim">Data e Hora de Fim</Label>
                <Input
                  id="data_fim"
                  name="data_fim"
                  type="datetime-local"
                  value={formData.data_fim}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição (opcional)</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  placeholder="Detalhes sobre a reserva..."
                  rows={3}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : (editingReserva ? 'Atualizar' : 'Criar')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reservas.map((reserva) => (
          <Card key={reserva.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{reserva.titulo}</CardTitle>
                  <CardDescription>
                    {getStatusBadge(reserva.status)}
                  </CardDescription>
                </div>
                {(user.nivel_acesso === 'admin' || reserva.usuario_id === user.id) && (
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(reserva)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleCancel(reserva)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="mr-2 h-4 w-4" />
                  {reserva.sala?.nome || 'Sala não encontrada'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  {formatDateTime(reserva.data_inicio)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="mr-2 h-4 w-4" />
                  até {formatDateTime(reserva.data_fim)}
                </div>
                {user.nivel_acesso === 'admin' && reserva.usuario && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="mr-2 h-4 w-4" />
                    {reserva.usuario.username}
                  </div>
                )}
                {reserva.descricao && (
                  <div className="text-sm text-gray-600 mt-2">
                    <p className="font-medium">Descrição:</p>
                    <p>{reserva.descricao}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reservas.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Nenhuma reserva encontrada.</p>
            <p className="text-sm text-gray-400">Clique em "Nova Reserva" para começar.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ReservasManager

