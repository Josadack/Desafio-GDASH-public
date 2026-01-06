# ⛈️ GDASH Backend

Backend distribuído para **coleta, processamento, persistência e análise de dados climáticos**, baseado em **arquitetura orientada a eventos** com mensageria assíncrona.

Este repositório contém **apenas o backend** do projeto GDASH. O frontend é mantido em um repositório separado.

---

## 📌 Visão Geral da Arquitetura

O sistema é composto por múltiplos serviços independentes que se comunicam via **RabbitMQ**, garantindo desacoplamento, escalabilidade e resiliência.

**Stack principal:**

* NestJS (API e regras de negócio)
* Go (worker de processamento)
* Python (coletor de dados externos)
* MongoDB (persistência)
* RabbitMQ (mensageria)
* Docker & Docker Compose (orquestração local)

---

## 🔄 Fluxo do Sistema

### 1. Coleta de dados climáticos (Python – Producer)

* Consome uma API externa de clima
* Coleta dados como cidade, temperatura e condições
* Publica os dados brutos na fila `weather_queue` (RabbitMQ)
* Não possui acesso ao banco de dados

Responsabilidade: **ingestão de dados**

---

### 2. Processamento e enriquecimento (Go Worker)

* Consome mensagens da fila `weather_queue`
* Valida e normaliza os dados recebidos
* Adiciona metadados (timestamp, contexto)
* Publica os dados enriquecidos na fila `weather_full_queue`
* Envia os dados processados para a API Nest

Responsabilidade: **processamento e enriquecimento**

---

### 3. Persistência e API (NestJS)

Serviço central do sistema.

Funcionalidades:

* Recebe dados processados do Go Worker
* Persiste dados no MongoDB
* Gerencia usuários e autenticação
* Disponibiliza dados via API REST
* Gera dashboards e insights agregados
* Exporta dados em formato XLSX

Responsabilidade: **regra de negócio, persistência e exposição de dados**

---

## 📡 Principais Endpoints

### Autenticação e Usuários

* `POST /api/users/auth/register`
* `POST /api/auth/login`
* `GET /api/users/all`
* `GET /api/users/{id}`

### Weather

* `POST /api/weather`
* `GET /api/weather`
* `POST /api/weather/logs`
* `GET /api/weather/logs`
* `GET /api/weather/export.xlsx`
* `GET /api/weather/insights`

### Dashboard

* `GET /api/dashboard`

A documentação completa está disponível via **Swagger**:

```
http://localhost:3000/swagger
```

---

## 🐳 Ambiente Local com Docker

Todo o backend pode ser executado localmente utilizando Docker Compose.

### Pré-requisitos

* Docker
* Docker Compose

### Subir o ambiente

```
docker compose up --build
```

Serviços iniciados:

* MongoDB
* RabbitMQ
* Python Producer
* Go Worker
* NestJS API

---

## 🔐 Variáveis de Ambiente

As variáveis sensíveis **não são versionadas**.

Cada serviço possui um arquivo `.env.example` como referência:

* `Back-end/desafio-gdash/.env.example`
* `go_worker/.env.example`
* `Python/.env.example`

Crie os arquivos `.env` correspondentes antes de subir o ambiente.

---

## 🚀 Deploy (Produção)

Para produção (ex: Render):

* NestJS e Go Worker são executados como serviços independentes
* MongoDB e RabbitMQ devem ser provisionados externamente
* Docker Compose é utilizado apenas para desenvolvimento local

---

## 🎯 Objetivo do Projeto

Demonstrar:

* Arquitetura orientada a eventos
* Comunicação assíncrona com RabbitMQ
* Separação clara de responsabilidades
* Processamento distribuído
* Boas práticas em APIs REST

Este backend foi projetado para ser **escalável, desacoplado e observável**.

---

## 👨‍💻 Autor

Josadaque Ferreira (J Dack)

* GitHub: [https://github.com/Josadack](https://github.com/Josadack)
* LinkedIn: [https://www.linkedin.com/in/josadaque-ferreira](https://www.linkedin.com/in/josadaque-ferreira)
