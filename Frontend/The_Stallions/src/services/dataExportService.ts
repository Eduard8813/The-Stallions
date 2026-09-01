import { Platform } from 'react-native';
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const APP_NAME = 'Wani Connect';

/**
 * Devuelve el asset del ícono de la app como un data-URI base64 para poder
 * incrustarlo en el HTML del PDF (expo-print no admite URLs locales de assets
 * en iOS).
 */
async function appIconBase64(): Promise<string | null> {
  try {
    const icon = Asset.fromModule(require('../../assets/images/app-icon.png'));
    await icon.downloadAsync();
    const file = new File(icon.localUri ?? icon.uri);
    const base64 = await file.base64();
    return `data:image/png;base64,${base64}`;
  } catch {
    return null;
  }
}

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function row(label: string, value: string): string {
  return value
    ? `<tr><td class="k">${esc(label)}</td><td>${esc(value)}</td></tr>`
    : '';
}

export interface DataExportUser {
  fullName?: string | null;
  email?: string | null;
  username?: string | null;
  phone?: string | null;
  city?: string | null;
  bio?: string | null;
  createdAt?: string | null;
}

function buildHtml(user: DataExportUser, icon: string | null): string {
  const fecha = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @page { margin: 24px; }
      * { box-sizing: border-box; }
      body {
        font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #1f2937;
        margin: 0;
        padding: 0;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 16px;
        padding-bottom: 16px;
        border-bottom: 3px solid #69b5e6;
      }
      .header img { width: 56px; height: 56px; border-radius: 12px; }
      .header h1 { margin: 0; font-size: 22px; color: #16679a; }
      .header p { margin: 2px 0 0; color: #6b7280; font-size: 13px; }
      h2 { font-size: 16px; color: #16679a; margin: 22px 0 8px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      td { padding: 8px 0; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
      td.k { width: 130px; color: #6b7280; font-weight: 600; }
      .footer { margin-top: 28px; color: #9ca3af; font-size: 11px; text-align: center; }
    </style>
  </head>
  <body>
    <div class="header">
      ${icon ? `<img src="${icon}" alt="icono" />` : ''}
      <div>
        <h1>${esc(APP_NAME)}</h1>
        <p>Exportación de datos personales</p>
      </div>
    </div>

    <h2>Datos de la cuenta</h2>
    <table>
      ${row('Nombre', user.fullName ?? '')}
      ${row('Correo', user.email ?? '')}
      ${row('Usuario', user.username ?? '')}
      ${row('Teléfono', user.phone ?? '')}
      ${row('Ciudad', user.city ?? '')}
      ${row('Biografía', user.bio ?? '')}
      ${row('Ingreso', user.createdAt ?? '')}
    </table>

    <div class="footer">
      Documento generado el ${fecha} · ${esc(APP_NAME)}
    </div>
  </body>
</html>`;
}

/**
 * Genera un PDF con los datos de la cuenta (con el ícono de la app) y abre el
 * diálogo de compartir/guardar. Lanza un Error si algo sale mal.
 */
export async function exportUserDataPdf(user: DataExportUser): Promise<void> {
  const icon = await appIconBase64();
  const html = buildHtml(user, icon);

  const { uri } = await Print.printToFileAsync({
    html,
    width: 612,
    height: 792,
  });

  if (Platform.OS === 'web') {
    return;
  }

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    return;
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Descargar mis datos',
    UTI: 'com.adobe.pdf',
  });
}
