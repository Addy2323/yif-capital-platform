#!/bin/bash

# YIF Capital Greenlight Branding Script
# This script safely applies YIF Capital brand colors and logo to BigBlueButton Greenlight

set -e  # Exit on any error

echo "========================================"
echo "YIF Capital Greenlight Branding Script"
echo "========================================"
echo ""

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# YIF Capital Brand Colors
PRIMARY_COLOR="#0A1F44"      # Deep Navy Blue
ACCENT_GOLD="#D4A017"        # Gold
ACCENT_SILVER="#B0B8C1"      # Silver Gray 
NEUTRAL_WHITE="#FFFFFF"      # White
DARK_CHARCOAL="#2E2E2E"      # Charcoal

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${YELLOW}Warning: Running as root${NC}"
fi

# Set Greenlight directory
GREENLIGHT_DIR=~/greenlight

# Check if directory exists
if [ ! -d "$GREENLIGHT_DIR" ]; then
    echo -e "${RED}Error: Greenlight directory not found at $GREENLIGHT_DIR${NC}"
    echo "Please specify the correct path or install Greenlight first."
    exit 1
fi

echo -e "${GREEN}✓${NC} Found Greenlight directory at $GREENLIGHT_DIR"

# Navigate to directory
cd $GREENLIGHT_DIR

# Create backup
BACKUP_FILE=".env.backup.$(date +%Y%m%d_%H%M%S)"
echo ""
echo "Creating backup: $BACKUP_FILE"
cp .env $BACKUP_FILE
echo -e "${GREEN}✓${NC} Backup created successfully"

echo ""
echo -e "${BLUE}Applying YIF Capital Brand Identity...${NC}"
echo ""

# ============================================
# PRIMARY_COLOR - Deep Navy Blue
# ============================================
if grep -q "PRIMARY_COLOR=" .env; then
    echo -e "${YELLOW}PRIMARY_COLOR already exists in .env${NC}"
    echo "Updating existing value..."
    sed -i "s/^PRIMARY_COLOR=.*$/PRIMARY_COLOR=$PRIMARY_COLOR/" .env
else
    echo "Adding PRIMARY_COLOR to .env..."
    echo "PRIMARY_COLOR=$PRIMARY_COLOR" >> .env
fi
echo -e "${GREEN}✓${NC} PRIMARY_COLOR set to $PRIMARY_COLOR (Deep Navy Blue)"

# ============================================
# BRAND_NAME - YIF Capital
# ============================================
if grep -q "BRAND_NAME=" .env; then
    echo -e "${YELLOW}BRAND_NAME already exists in .env${NC}"
    echo "Updating existing value..."
    sed -i 's/^BRAND_NAME=.*$/BRAND_NAME=YIF Capital/' .env
else
    echo "Adding BRAND_NAME to .env..."
    echo "BRAND_NAME=YIF Capital" >> .env
fi
echo -e "${GREEN}✓${NC} BRAND_NAME set to 'YIF Capital'"

# ============================================
# BRANDING_IMAGE - Custom Logo
# ============================================
LOGO_PATH="/uploads/custom/logo.png"
STORAGE_DIR="$GREENLIGHT_DIR/storage/uploads/custom"

# Create the custom uploads directory if it doesn't exist
if [ ! -d "$STORAGE_DIR" ]; then
    echo ""
    echo "Creating custom uploads directory..."
    mkdir -p "$STORAGE_DIR"
    echo -e "${GREEN}✓${NC} Created directory: $STORAGE_DIR"
fi

# Check if logo exists in the directory
if [ ! -f "$STORAGE_DIR/logo.png" ]; then
    echo ""
    echo -e "${YELLOW}⚠ Logo file not found at $STORAGE_DIR/logo.png${NC}"
    echo ""
    echo "Please upload your YIF Capital logo to the server using one of these methods:"
    echo ""
    echo "  Option 1 - SCP from Windows:"
    echo "    scp logo.png user@your-server:$STORAGE_DIR/"
    echo ""
    echo "  Option 2 - Download from URL:"
    echo "    wget -O $STORAGE_DIR/logo.png https://your-domain.com/logo.png"
    echo ""
    echo "  Option 3 - Copy from current directory:"
    echo "    cp /path/to/your/logo.png $STORAGE_DIR/"
    echo ""
else
    echo -e "${GREEN}✓${NC} Logo file found at $STORAGE_DIR/logo.png"
fi

if grep -q "BRANDING_IMAGE=" .env; then
    echo -e "${YELLOW}BRANDING_IMAGE already exists in .env${NC}"
    echo "Updating existing value..."
    sed -i "s|^BRANDING_IMAGE=.*$|BRANDING_IMAGE=$LOGO_PATH|" .env
else
    echo "Adding BRANDING_IMAGE to .env..."
    echo "BRANDING_IMAGE=$LOGO_PATH" >> .env
fi
echo -e "${GREEN}✓${NC} BRANDING_IMAGE set to $LOGO_PATH"

# ============================================
# HELP_URL - YIF Capital Website
# ============================================
if ! grep -q "HELP_URL=" .env; then
    echo ""
    echo "Adding HELP_URL to .env..."
    echo "HELP_URL=https://yifcapital.co.tz" >> .env
    echo -e "${GREEN}✓${NC} HELP_URL set to https://yifcapital.co.tz"
else
    echo -e "${GREEN}✓${NC} HELP_URL already configured"
fi

# ============================================
# LINK_COLOR - Gold accent for links (optional)
# ============================================
if grep -q "LINK_COLOR=" .env; then
    sed -i "s/^LINK_COLOR=.*$/LINK_COLOR=$ACCENT_GOLD/" .env
else
    echo "LINK_COLOR=$ACCENT_GOLD" >> .env
fi
echo -e "${GREEN}✓${NC} LINK_COLOR set to $ACCENT_GOLD (Gold)"

echo ""
echo "========================================"
echo -e "${BLUE}Configuration Summary${NC}"
echo "========================================"
echo ""
echo -e "Brand Name:      ${GREEN}YIF Capital${NC}"
echo -e "Primary Color:   ${GREEN}$PRIMARY_COLOR${NC} (Deep Navy Blue)"
echo -e "Link Color:      ${GREEN}$ACCENT_GOLD${NC} (Gold)"
echo -e "Logo Path:       ${GREEN}$LOGO_PATH${NC}"
echo -e "Help URL:        ${GREEN}https://yifcapital.co.tz${NC}"
echo ""
echo "Brand Color Palette Reference:"
echo "  60% Primary:    $PRIMARY_COLOR (Deep Navy Blue)"
echo "  15% Accent 1:   $ACCENT_GOLD (Gold)"
echo "  15% Accent 2:   $ACCENT_SILVER (Silver Gray)"
echo "  25% Neutrals:   $NEUTRAL_WHITE (White) + $DARK_CHARCOAL (Charcoal)"
echo ""

# Ask user if they want to restart now
echo "========================================"
echo "Ready to apply changes!"
echo "========================================"
echo ""
read -p "Do you want to restart Greenlight now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Restarting Greenlight containers..."
    docker-compose down
    docker-compose up -d
    
    echo ""
    echo -e "${GREEN}✓✓✓ Success! ✓✓✓${NC}"
    echo ""
    echo -e "Your Greenlight has been branded with ${BLUE}YIF Capital${NC} colors!"
    echo ""
    echo "Next steps:"
    echo "1. Visit https://meet.yifcapital.co.tz"
    echo "2. Clear your browser cache (Ctrl+Shift+Delete)"
    echo "3. Refresh the page (Ctrl+F5)"
    echo ""
    echo "To restore previous settings:"
    echo "   cp $BACKUP_FILE .env"
    echo "   docker-compose down && docker-compose up -d"
    echo ""
else
    echo ""
    echo -e "${YELLOW}Changes saved but not applied yet.${NC}"
    echo ""
    echo "To apply changes manually, run:"
    echo "   cd $GREENLIGHT_DIR"
    echo "   docker-compose down && docker-compose up -d"
    echo ""
    echo "To restore previous settings:"
    echo "   cp $BACKUP_FILE .env"
    echo "   docker-compose down && docker-compose up -d"
    echo ""
fi

echo "Backup saved as: $BACKUP_FILE"
echo ""
echo -e "${GREEN}Done!${NC}"
echo ""
echo "========================================"
echo "YIF Capital - Investment | Capital Markets | Financial Education"
echo "========================================"
