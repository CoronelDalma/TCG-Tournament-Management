# TCG-Tournament-Management
Tournament and league setup system for TCG card game competitions

# 🃏 Sistema de Gestión de Torneos TCG con Formato Suizo

Este proyecto es una aplicación fullstack para gestionar torneos de juegos de cartas TCG (Trading Card Games) como Magic, Yu-Gi-Oh!, Pokémon, etc. Utiliza arquitectura limpia, TDD y separación por capas para organizar jugadores, mazos, emparejamientos y resultados en torneos con formato suizo.

## ✨ Funcionalidades principales

- Registro y autenticación de jugadores
- Declaración de mazos (tipo y cartas)
- Creación de torneos con formato suizo
- Inscripción de jugadores
- Generación de emparejamientos por ronda
- Registro de resultados
- Cálculo de standings (puntajes y desempates)
- Visualización de historial de partidas

## 🧱 Tecnologías utilizadas

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express + TypeScript
- **Dominio**: TypeScript puro
- **Testing**: Vitest
- **Autenticación**: JWT
- **Persistencia**: SQLite3 (puede escalar a PostgreSQL)
- **Gestión de paquetes**: npm con workspaces
- **Validaciones**: zod

## 📁 Estructura del proyecto

## 🚀 Instalación

```bash
npm install
```

## Ejecutar tests
```bash
cd domain
npm test
```

## Ejecutar backend
```bash
cd apps/backend
npm run dev
```


## Ejecutar frontend ( próximamente )
```bash
cd apps/frontend
npm run dev
```


