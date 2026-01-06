# Stage 1: Build
FROM golang:1.22 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o worker

# Stage 2: Runtime
FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/worker /worker

ENV GODEBUG=x509ignoreCN=0

CMD ["/worker"]
