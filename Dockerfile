FROM node:24-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

FROM python:3.14-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend ./backend
COPY --from=frontend /app/frontend/dist ./frontend/dist

EXPOSE 8000
CMD ["sh", "-c", "cd backend && alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --app-dir ."]
