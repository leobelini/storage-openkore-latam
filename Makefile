APP_NAME := Storage Openkore Latam
OUTPUT_DIR := build


.PHONY: all x64 x86 clean

all: clean x64 x86

x64:
	@echo "🔨 Build x64..."
	@GOOS=windows GOARCH=amd64 wails build -o $(OUTPUT_DIR)/$(APP_NAME)-x64.exe

x86:
	@echo "🔨 Build x86..."
	@GOOS=windows GOARCH=386 wails build -o $(OUTPUT_DIR)/$(APP_NAME)-x86.exe

clean:
	@echo "🧹 Limpando build..."
	@rm -rf $(OUTPUT_DIR)