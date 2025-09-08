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
import { Plus, Edit, Trash2, MapPin, Users, Monitor } from 'lucide-react'

const SalasManager = ({ onStatsUpdate }) => {
  const [salas, setSalas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSala, setEditingSala] = useState(null)
  const [formData, setFormData] = useState({
    nome: '',
    capacidade: '',
    localizacao: '',
    tipo: '',
    equipamentos: ''
  })

  const tiposSala = ['Reunião', 'Auditório', 'Laboratório', 'Sala de Treinamento', 'Escritório', 'Coworking']

  useEffect(() => {
    loadSalas()
  }, [])

  const loadSalas = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/salas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSalas(data.salas || [])
        if (onStatsUpdate) onStatsUpdate()
      } else {
        setError('Erro ao carregar salas')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const equipamentosArray = formData.equipamentos
        .split(',')
        .map(eq => eq.trim())
        .filter(eq => eq.length > 0)

      const payload = {
        ...formData,
        capacidade: parseInt(formData.capacidade),
        equipamentos: equipamentosArray
      }

      const url = editingSala ? `/api/salas/${editingSala.id}` : '/api/salas'
      const method = editingSala ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        await loadSalas()
        setDialogOpen(false)
        resetForm()
      } else {
        const data = await response.json()
        setError(data.message || 'Erro ao salvar sala')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (sala) => {
    setEditingSala(sala)
    setFormData({
      nome: sala.nome,
      capacidade: sala.capacidade.toString(),
      localizacao: sala.localizacao,
      tipo: sala.tipo,
      equipamentos: Array.isArray(sala.equipamentos) 
        ? sala.equipamentos.join(', ')
        : (sala.equipamentos || '').replace(/[\[\]"]/g, '').split(',').join(', ')
    })
    setDialogOpen(true)
  }

  const handleDelete = async (sala) => {
    if (!confirm(`Tem certeza que deseja desativar a sala "${sala.nome}"?`)) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/salas/${sala.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await loadSalas()
      } else {
        const data = await response.json()
        setError(data.message || 'Erro ao desativar sala')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      capacidade: '',
      localizacao: '',
      tipo: '',
      equipamentos: ''
    })
    setEditingSala(null)
    setError('')
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Salas</h2>
          <p className="text-gray-600">Gerencie as salas e recursos disponíveis</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Sala
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingSala ? 'Editar Sala' : 'Nova Sala'}
              </DialogTitle>
              <DialogDescription>
                {editingSala ? 'Edite as informações da sala' : 'Adicione uma nova sala ao sistema'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Sala</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Ex: Sala de Reunião A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacidade">Capacidade</Label>
                <Input
                  id="capacidade"
                  name="capacidade"
                  type="number"
                  value={formData.capacidade}
                  onChange={handleChange}
                  placeholder="Ex: 10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="localizacao">Localização</Label>
                <Input
                  id="localizacao"
                  name="localizacao"
                  value={formData.localizacao}
                  onChange={handleChange}
                  placeholder="Ex: Andar 1 - Ala Norte"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposSala.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipamentos">Equipamentos</Label>
                <Textarea
                  id="equipamentos"
                  name="equipamentos"
                  value={formData.equipamentos}
                  onChange={handleChange}
                  placeholder="Ex: Projetor, Quadro branco, Sistema de som"
                  rows={3}
                />
                <p className="text-xs text-gray-500">Separe os equipamentos por vírgula</p>
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
                  {loading ? 'Salvando...' : (editingSala ? 'Atualizar' : 'Criar')}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salas.map((sala) => (
          <Card key={sala.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{sala.nome}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary">{sala.tipo}</Badge>
                  </CardDescription>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(sala)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(sala)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="mr-2 h-4 w-4" />
                  {sala.localizacao}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="mr-2 h-4 w-4" />
                  Capacidade: {sala.capacidade} pessoas
                </div>
                {sala.equipamentos && (
                  <div className="flex items-start text-sm text-gray-600">
                    <Monitor className="mr-2 h-4 w-4 mt-0.5" />
                    <div>
                      {typeof sala.equipamentos === 'string' 
                        ? sala.equipamentos.replace(/[\[\]"]/g, '').split(',').map(eq => eq.trim()).join(', ')
                        : Array.isArray(sala.equipamentos) 
                          ? sala.equipamentos.join(', ')
                          : 'Nenhum equipamento'
                      }
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {salas.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Nenhuma sala cadastrada ainda.</p>
            <p className="text-sm text-gray-400">Clique em "Nova Sala" para começar.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SalasManager

