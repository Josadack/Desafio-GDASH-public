package main

import (
    "bytes"
    "encoding/json"
    "errors"
    "log"
    "net/http"
)

func SendToBackend(data WeatherPayload, backendURL string) error {
    // converter struct para JSON
    jsonData, err := json.Marshal(data)
    if err != nil {
        return err
    }

    // montar requisição
    req, err := http.NewRequest("POST", backendURL, bytes.NewBuffer(jsonData))
    if err != nil {
        return err
    }

    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    // validar resposta
    if resp.StatusCode < 200 || resp.StatusCode >= 300 {
        log.Printf("[Worker] Erro HTTP do Backend: %d\n", resp.StatusCode)
        return errors.New("backend returned non-2xx status")
    }

    log.Println("[Worker] Dados enviados com sucesso para API NestJS!")
    return nil
}
