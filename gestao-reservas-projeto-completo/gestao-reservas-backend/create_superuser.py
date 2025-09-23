import os
from django.contrib.auth import get_user_model
def run():
    U=get_user_model()
    u=os.environ.get("DJANGO_SUPERUSER_USERNAME","admin")
    e=os.environ.get("DJANGO_SUPERUSER_EMAIL","admin@example.com")
    p=os.environ.get("DJANGO_SUPERUSER_PASSWORD","admin123")
    if not U.objects.filter(username=u).exists():
        U.objects.create_superuser(u, e, p)
        print("Superuser criado")
    else:
        print("Superuser já existe")
