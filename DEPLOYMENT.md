# Guía de Deployment para Producción

Esta guía cubre todos los pasos necesarios para desplegar la aplicación Calendario TDAH en producción.

## Prerequisitos

- Python 3.9+
- Node.js 18+ y npm
- Servidor con HTTPS configurado
- Base de datos PostgreSQL (recomendado para producción)

## Paso 1: Preparar Variables de Entorno

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Edita `.env` y configura las variables para producción:

```bash
# Generar SECRET_KEY segura
python -c "import secrets; print(secrets.token_hex(32))"
```

3. Actualiza `.env` con tus valores de producción:
```env
DATABASE_URL=postgresql://user:password@localhost/calendario_tdah
SECRET_KEY=<tu_clave_generada_aqui>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=https://tudominio.com,https://www.tudominio.com
ENVIRONMENT=production
ENABLE_HSTS=true
```

## Paso 2: Configurar Base de Datos

1. Crear base de datos PostgreSQL:
```sql
CREATE DATABASE calendario_tdah;
CREATE USER calendario_user WITH PASSWORD 'password_seguro';
GRANT ALL PRIVILEGES ON DATABASE calendario_tdah TO calendario_user;
```

2. Ejecutar migraciones de Alembic:
```bash
alembic upgrade head
```

3. (Opcional) Crear categorías iniciales:
```bash
python dev_tools/seed_db.py
```

## Paso 3: Build del Frontend

1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear build de producción:
```bash
npm run build
```

Esto generará una carpeta `dist/` con los archivos estáticos optimizados.

## Paso 4: Configurar Servidor Web

### Opción A: Nginx como proxy reverso

1. Configurar Nginx para servir el frontend y hacer proxy al backend:

```nginx
server {
    listen 80;
    server_name tudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tudominio.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend estático
    location / {
        root /path/to/calendario-TDHA/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Documentación API (opcional, solo si quieres exponer /docs)
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
    }
}
```

2. Reiniciar Nginx:
```bash
sudo systemctl restart nginx
```

### Opción B: Servir frontend y backend con Uvicorn + Static Files

Si prefieres no usar Nginx, puedes servir los archivos estáticos desde FastAPI:

1. Instalar paquete adicional:
```bash
pip install aiofiles
```

2. Actualizar `main.py` para servir archivos estáticos (se puede hacer después).

## Paso 5: Ejecutar Backend en Producción

### Opción A: Systemd Service (Linux)

1. Crear archivo de servicio `/etc/systemd/system/calendario-api.service`:

```ini
[Unit]
Description=Calendario TDAH API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/calendario-TDHA
Environment="PATH=/path/to/calendario-TDHA/.venv/bin"
ExecStart=/path/to/calendario-TDHA/.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

2. Habilitar e iniciar el servicio:
```bash
sudo systemctl enable calendario-api
sudo systemctl start calendario-api
sudo systemctl status calendario-api
```

### Opción B: Gunicorn + Uvicorn Workers

1. Instalar Gunicorn:
```bash
pip install gunicorn
```

2. Ejecutar con múltiples workers:
```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Paso 6: Verificación Post-Deployment

### Verificar Backend

1. Health check:
```bash
curl https://tudominio.com/api/
```

Respuesta esperada: `{"message":"La API del Calendario TDAH esta viva!"}`

2. Verificar headers de seguridad:
```bash
curl -I https://tudominio.com/api/
```

Buscar:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

### Verificar Frontend

1. Acceder a `https://tudominio.com`
2. Verificar que la página carga correctamente
3. Probar registro de usuario
4. Probar login
5. Verificar funcionalidad de calendario y tareas

## Paso 7: Monitoreo y Logs

### Logs del Backend

Si usas systemd:
```bash
journalctl -u calendario-api -f
```

Si usas nohup:
```bash
tail -f nohup.out
```

### Configurar Logging en Python

El backend ya usa logging. Para producción, considera:

1. Agregar rotación de logs
2. Enviar logs a servicio externo (CloudWatch, Datadog, etc.)
3. Configurar alertas para errores

## Paso 8: Backup

### Backup de Base de Datos

PostgreSQL:
```bash
pg_dump -U calendario_user calendario_tdah > backup_$(date +%Y%m%d).sql
```

SQLite (si aún lo usas):
```bash
sqlite3 calendario.db ".backup backup_$(date +%Y%m%d).db"
```

### Automatizar Backups

Crear cron job:
```bash
# Backup diario a las 3 AM
0 3 * * * /path/to/backup_script.sh
```

## Checklist Final de Producción

- [ ] Variables de entorno configuradas
- [ ] SECRET_KEY generada aleatoriamente
- [ ] Base de datos PostgreSQL configurada
- [ ] Migraciones ejecutadas
- [ ] Frontend compilado (`npm run build`)
- [ ] HTTPS configurado con certificado válido
- [ ] HSTS habilitado (`ENABLE_HSTS=true`)
- [ ] CORS configurado para dominios de producción
- [ ] Backend ejecutándose como servicio
- [ ] Nginx configurado (si aplica)
- [ ] Logs configurados
- [ ] Backups programados
- [ ] Monitoreo básico implementado

## Archivos que NO deben estar en Producción

Los siguientes archivos/carpetas están en `dev_tools/` y NO deben desplegarse:

- `create_tables_debug.py`
- `verify_*.py`
- `test_paginacion.py`
- `nuke_users.py`
- Etc.

Asegúrate de que tu sistema de deployment excluya la carpeta `dev_tools/` o usa `.gitignore` apropiadamente.

## Troubleshooting

### Error: "Secret key is not configured"
- Verifica que `.env` existe y contiene `SECRET_KEY`
- Verifica que `python-dotenv` está instalado

### Error: CORS bloqueando requests
- Verifica `ALLOWED_ORIGINS` en `.env`
- Asegúrate de incluir el protocolo (`https://`)
- No incluyas trailing slash

### Error: Base de datos no conecta
- Verifica `DATABASE_URL` en `.env`
- Verifica credenciales de PostgreSQL
- Verifica que el servidor de BD está accesible

### Frontend muestra página en blanco
- Verifica que el build se hizo correctamente
- Verifica la consola del navegador para errores
- Verifica que `base: './'` está en `vite.config.js`

## Seguridad Adicional

1. **Rate Limiting**: Considera agregar rate limiting a los endpoints
2. **WAF**: Usar Web Application Firewall (Cloudflare, AWS WAF)
3. **Actualizar dependencias**: Mantener dependencias actualizadas
4. **Auditorías**: Ejecutar `pip audit` y `npm audit` regularmente
5. **Secretos**: Nunca commitear `.env` al repositorio

## Soporte

Para problemas o preguntas, consulta:
- README.md principal
- Documentación de API en `/docs` (si está habilitada)
- Logs del sistema
