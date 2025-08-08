package main

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha1"
	"encoding/base64"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"golang.org/x/crypto/pbkdf2"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) SelectFolder() (string, error) {
	folder, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Selecione a pasta para salvar o arquivo",
	})
	return folder, err
}

func (a *App) CreateFileConfig(folderPath, fileName, password, content string) error {
	fullPath := filepath.Join(folderPath, fileName)

	if _, err := os.Stat(fullPath); err == nil {
		return fmt.Errorf("FILE_ALREADY_EXISTS")
	}

	encryptedContent, err := encrypt(content, password)
	if err != nil {
		return err
	}

	return os.WriteFile(fullPath, []byte(encryptedContent), 0644)
}

func (a *App) ReplaceFile(filePath, content, password string) error {

	encryptedContent, err := encrypt(content, password)
	if err != nil {
		return err
	}

	return os.WriteFile(filePath, []byte(encryptedContent), 0644)
}

type LoadFileConfigResponse struct {
	Content string
	Path    string
}

func (a *App) LoadFileConfig(password string) (LoadFileConfigResponse, error) {

	response := LoadFileConfigResponse{}

	// Abre seletor de arquivo
	file, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Selecione uma configuração",
		Filters: []runtime.FileFilter{
			{DisplayName: "Configuração", Pattern: "*.start-openkore-latam"},
		},
	})
	if err != nil || file == "" {
		return response, err
	}

	// Lê o conteúdo do arquivo
	data, err := os.ReadFile(file)
	if err != nil {
		return response, err
	}

	// Descriptografa o conteúdo
	decryptedContent, err := decrypt(string(data), password)
	if err != nil {
		return response, err
	}

	response.Content = string(decryptedContent)
	response.Path = file

	return response, nil
}

type ReplaceFileConfigParam struct {
	Title  string
	Filter []runtime.FileFilter
}

func (a *App) GetPathFile(param ReplaceFileConfigParam) (string, error) {
	file, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title:   param.Title,
		Filters: param.Filter,
	})
	if err != nil || file == "" {
		return "", err
	}

	return file, nil
}

func deriveKey(password, salt []byte) []byte {
	// Deriva uma chave de 32 bytes (AES-256) usando PBKDF2-SHA1 com 100k iterações
	return pbkdf2.Key(password, salt, 100000, 32, sha1.New)
}

func encrypt(plainText, password string) (string, error) {
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}

	key := deriveKey([]byte(password), salt)

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, aesgcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := aesgcm.Seal(nil, nonce, []byte(plainText), nil)

	// Resultado: salt + nonce + ciphertext, codificado em base64
	result := append(salt, nonce...)
	result = append(result, ciphertext...)

	return base64.StdEncoding.EncodeToString(result), nil
}

func decrypt(cipherTextBase64, password string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(cipherTextBase64)
	if err != nil {
		return "", err
	}

	if len(data) < 16 {
		return "", fmt.Errorf("dados muito curtos")
	}

	salt := data[:16]
	key := deriveKey([]byte(password), salt)

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := aesgcm.NonceSize()
	if len(data) < 16+nonceSize {
		return "", fmt.Errorf("dados muito curtos para nonce")
	}

	nonce := data[16 : 16+nonceSize]
	ciphertext := data[16+nonceSize:]

	plaintext, err := aesgcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}
