package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

const assetsDir = "./dist_assets"

type Config struct {
	CacheVvquiezKey *string `json:"cache_vvquiez_key"`
}

const configPath = "settings.json"

func assetsHandler(w http.ResponseWriter, r *http.Request) {
	filename := r.PathValue("filename") // Получаем "<hash>.png"

	// Базовая защита от выхода из папки (Path Traversal)
	safePath := filepath.Clean(filepath.Join(assetsDir, filename))
	if !strings.HasPrefix(safePath, filepath.Clean(assetsDir)) {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	// Проверяем наличие запрашиваемой текстуры
	if _, err := os.Stat(safePath); os.IsNotExist(err) {
		http.Error(w, "Texture Not Found", http.StatusNotFound)
		return
	}

	// Идеальные заголовки для CDN. Файл непредсказуем и постоянен.
	w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	w.Header().Set("Content-Type", "image/png")

	// Стриминг картинки через Zero-Copy в сеть
	http.ServeFile(w, r, safePath)
}

// Функция генерации 32-байтного ключа для ChaCha20-Poly1305 в формате Hex
func generateChaCha20Key() (string, error) {
	key := make([]byte, 32) // ChaCha20-Poly1305 строго требует 32 байта
	_, err := rand.Read(key)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(key), nil
}

func loadOrGenerateConfig() (*Config, error) {
	config := &Config{}
	var fileExists = true

	// 1. Читаем файл settings.json
	data, err := os.ReadFile(configPath)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			fileExists = false
		} else {
			return nil, fmt.Errorf("ошибка чтения файла: %w", err)
		}
	}

	// 2. Если файл есть, парсим его
	if fileExists {
		if err := json.Unmarshal(data, config); err != nil {
			return nil, fmt.Errorf("ошибка парсинга JSON: %w", err)
		}
	}

	var updated = false

	// 3. Проверяем: если поле отсутствует (nil) ИЛИ передана пустая строка ("")
	if config.CacheVvquiezKey == nil || *config.CacheVvquiezKey == "" {
		fmt.Println("Ключ cache_vvquiez_key отсутствует или пуст. Генерируем новый для ChaCha20-Poly1305...")

		newKey, err := generateChaCha20Key()
		if err != nil {
			return nil, fmt.Errorf("ошибка генерации ключа: %w", err)
		}

		config.CacheVvquiezKey = &newKey
		updated = true
	}

	// 4. Перезаписываем файл, если были изменения или файла не существовало
	if !fileExists || updated {
		newData, err := json.MarshalIndent(config, "", "    ")
		if err != nil {
			return nil, fmt.Errorf("ошибка сериализации JSON: %w", err)
		}

		if err := os.WriteFile(configPath, newData, 0600); err != nil {
			return nil, fmt.Errorf("ошибка записи в файл: %w", err)
		}

		fmt.Println("Файл конфигурации успешно обновлен.")
	}

	return config, nil
}

func vvquizeApp(w http.ResponseWriter, r *http.Request) {
	command := r.PathValue("command")
	w.Header().Set("Cache-Control", "no-store")
	fmt.Fprintf(w, "fdsfdsf, %s", command)
}

func main() {
	loadOrGenerateConfig()
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/v1/assets/{filename}", assetsHandler)
	mux.HandleFunc("GET /api/v1/quiz/cmd/{command}", vvquizeApp)
	// mux.HandleFunc("GET /api/v1/quiz/cmd/{command}", vvquizeApp)

	log.Println("🚀 Высокопроизводительный ассет-сервер Go запущен на :8080")
	http.ListenAndServe(":8080", mux)
}
