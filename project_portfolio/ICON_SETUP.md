# Icon Setup Instructions

The 3D infinity orbit animation requires PNG icons for each tool. Icons should be placed in:

```
static/image/tools/
```

## Required Icon Files

All icon filenames MUST be lowercase and match the tool name exactly:

- `aws.png`
- `docker.png`
- `kubernetes.png`
- `terraform.png`
- `jenkins.png`
- `gitlab.png`
- `ansible.png`
- `prometheus.png`
- `grafana.png`
- `python.png`
- `django.png`
- `postgresql.png`
- `redis.png`
- `nginx.png`
- `react.png`

## Icon Specifications

- **Format**: PNG with transparent background
- **Size**: 256x256px or 512x512px recommended
- **Style**: Flat, modern logos work best
- **Color**: Original brand colors

## Where to Get Icons

### Option 1: Simple Logos (Recommended)
Visit [Simple Icons](https://simpleicons.org/) - Download SVGs and convert to PNG

### Option 2: DevIcon
Visit [DevIcon](https://devicon.dev/) - Technology logos in various formats

### Option 3: Official Brand Sites
Download official logos from each tool's website

## Quick Setup Script

Create a bash script `download_icons.sh`:

```bash
#!/bin/bash

# Create directory
mkdir -p static/image/tools/

# Use placeholder icons (you'll need to replace with real ones)
echo "Please manually download icons from:"
echo "https://simpleicons.org/"
echo ""
echo "Required icons:"
echo "- aws.png"
echo "- docker.png"
echo "- kubernetes.png"
echo "- terraform.png"
echo "- jenkins.png"
echo "- gitlab.png"
echo "- ansible.png"
echo "- prometheus.png"
echo "- grafana.png"
echo "- python.png"
echo "- django.png"
echo "- postgresql.png"
echo "- redis.png"
echo "- nginx.png"
echo "- react.png"
```

## Convert SVG to PNG (if needed)

If you download SVG files, convert them to PNG:

### Using ImageMagick:
```bash
convert input.svg -resize 256x256 -background none output.png
```

### Using Inkscape:
```bash
inkscape input.svg --export-png=output.png --export-width=256 --export-height=256
```

### Using Online Tools:
- [CloudConvert](https://cloudconvert.com/svg-to-png)
- [Convertio](https://convertio.co/svg-png/)

## Verify Icons

After adding icons, verify they exist:

```bash
ls -la static/image/tools/
```

You should see all 15 PNG files.

## Testing

1. Run the seed command:
```bash
python manage.py seed_tools
```

2. Start the server:
```bash
python manage.py runserver
```

3. Visit `http://localhost:8000` and scroll to the Skills section

4. You should see icons orbiting in an infinity (∞) pattern

## Troubleshooting

### Icons not showing?
- Check browser console for 404 errors
- Verify filenames are lowercase and match tool names exactly
- Ensure files are PNG format with transparent backgrounds
- Clear browser cache and refresh

### Icons too small/large?
- Recommended size: 256x256px or 512x512px
- The Three.js scene auto-scales sprites to 1x1 units

### Wrong icon path?
- Icons MUST be in: `static/image/tools/<toolname>.png`
- Filename must be lowercase
- Example: For "AWS" tool, use `aws.png`