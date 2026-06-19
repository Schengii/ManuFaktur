Add-Type -AssemblyName System.Drawing

function Trim-Transparent {
    param(
        [string]$filePath
    )

    Write-Host "Trimming $filePath..."
    $resolvedPath = (Resolve-Path $filePath).Path
    $bmp = [System.Drawing.Bitmap]::new($resolvedPath)
    
    $width = $bmp.Width
    $height = $bmp.Height
    
    # LockBits fuer extrem schnellen Pixel-Zugriff
    $rect = [System.Drawing.Rectangle]::new(0, 0, $width, $height)
    $ptr = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    $byteCount = $ptr.Stride * $height
    $data = New-Object byte[] $byteCount
    [System.Runtime.InteropServices.Marshal]::Copy($ptr.Scan0, $data, 0, $byteCount)
    $bmp.UnlockBits($ptr)
    
    # Bounding Box bestimmen
    $minX = $width
    $maxX = 0
    $minY = $height
    $maxY = 0
    $hasContent = $false
    
    for ($y = 0; $y -lt $height; $y++) {
        for ($x = 0; $x -lt $width; $x++) {
            $offset = ($y * $ptr.Stride) + ($x * 4)
            $alpha = $data[$offset + 3]
            
            # Wenn Pixel nicht transparent ist (Alpha > 10)
            if ($alpha -gt 10) {
                $hasContent = $true
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    
    if (-not $hasContent) {
        Write-Host "Keine sichtbaren Pixel gefunden!"
        $bmp.Dispose()
        return
    }
    
    # Bounding Box berechnen (mit 2px Sicherheitsabstand)
    $cropX = [Math]::Max(0, $minX - 2)
    $cropY = [Math]::Max(0, $minY - 2)
    $cropW = [Math]::Min($width - $cropX, ($maxX - $minX) + 4)
    $cropH = [Math]::Min($height - $cropY, ($maxY - $minY) + 4)
    
    Write-Host "Boring Box: X=$cropX, Y=$cropY, W=$cropW, H=$cropH"
    
    # Croppen
    $cropRect = [System.Drawing.Rectangle]::new($cropX, $cropY, $cropW, $cropH)
    $croppedBmp = $bmp.Clone($cropRect, $bmp.PixelFormat)
    $bmp.Dispose()
    
    # Überschreiben
    $croppedBmp.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Png)
    $croppedBmp.Dispose()
    Write-Host "Fertig cropped: $filePath"
}

Trim-Transparent -filePath 'c:\Users\sche-\Desktop\Programmieren Projekte\ManuFaktur\assets\images\logos\logo-transparent.png'
Trim-Transparent -filePath 'c:\Users\sche-\Desktop\Programmieren Projekte\ManuFaktur\assets\images\logos\Logo2-transparent.png'
