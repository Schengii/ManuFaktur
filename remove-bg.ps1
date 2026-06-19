Add-Type -AssemblyName System.Drawing

function Convert-To-Transparent {
    param(
        [string]$srcPath,
        [string]$dstPath
    )

    Write-Host "Verarbeite $srcPath -> $dstPath..."
    
    $bmp = [System.Drawing.Bitmap]::new($srcPath)
    
    # In 32bppArgb Format konvertieren
    $result = [System.Drawing.Bitmap]::new($bmp.Width, $bmp.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($result)
    $g.DrawImage($bmp, 0, 0)
    $g.Dispose()
    $bmp.Dispose()
    
    # LockBits fuer extrem schnellen Pixel-Zugriff
    $rect = [System.Drawing.Rectangle]::new(0, 0, $result.Width, $result.Height)
    $ptr = $result.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    $byteCount = $ptr.Stride * $result.Height
    $data = New-Object byte[] $byteCount
    [System.Runtime.InteropServices.Marshal]::Copy($ptr.Scan0, $data, 0, $byteCount)
    
    # Pixel mit RGB > 240 transparent machen (weisser Hintergrund)
    # Und Pixel nahe an Weiss (z.B. Kantenglaettung) anteilig transparent machen
    for ($i = 0; $i -lt $byteCount; $i += 4) {
        $blue  = $data[$i]
        $green = $data[$i + 1]
        $red   = $data[$i + 2]
        
        # Berechne Helligkeit
        # Wenn R, G und B alle sehr hell sind (Kantenglaettung oder reines Weiss)
        if ($red -gt 238 -and $green -gt 238 -and $blue -gt 238) {
            # Komplett transparent
            $data[$i + 3] = 0
        } elseif ($red -gt 220 -and $green -gt 220 -and $blue -gt 220) {
            # Weiche Kanten: Alpha herabsetzen
            $minVal = [Math]::Min($red, [Math]::Min($green, $blue))
            $alphaFactor = (255 - $minVal) / (255 - 220)
            $newAlpha = [int]($data[$i + 3] * $alphaFactor)
            if ($newAlpha -lt 0) { $newAlpha = 0 }
            $data[$i + 3] = $newAlpha
        }
    }
    
    [System.Runtime.InteropServices.Marshal]::Copy($data, 0, $ptr.Scan0, $byteCount)
    $result.UnlockBits($ptr)
    
    # Speichern
    $result.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $result.Dispose()
    Write-Host "Fertig: $dstPath erfolgreich erstellt."
}

Convert-To-Transparent -srcPath 'c:\Users\sche-\Desktop\Programmieren Projekte\ManuFaktur\assets\images\logos\Logo2.png' -dstPath 'c:\Users\sche-\Desktop\Programmieren Projekte\ManuFaktur\assets\images\logos\Logo2-transparent.png'
Convert-To-Transparent -srcPath 'c:\Users\sche-\Desktop\Programmieren Projekte\ManuFaktur\assets\images\logos\logo.png' -dstPath 'c:\Users\sche-\Desktop\Programmieren Projekte\ManuFaktur\assets\images\logos\logo-transparent.png'
