import { Guest, GuestStatus } from '../types';
import { INITIAL_GUESTS } from '../data/weddingData';
import { apiService } from './apiService';
import { authService } from './authService';

const STORAGE_KEY = 'mateo_camila_wedding_guests_v1';

class StorageService {
  private listeners: Array<() => void> = [];
  private cache: Guest[] = INITIAL_GUESTS;

  constructor() {
    void this.refreshGuests();
  }

  private readLocalCache(): Guest[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_GUESTS;
    } catch {
      return INITIAL_GUESTS;
    }
  }

  private persistCache(guests: Guest[]): void {
    this.cache = guests;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
    } catch {
      // ignore
    }
    this.notify();
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notify(): void {
    this.listeners.forEach(callback => callback());
  }

  public async refreshGuests(): Promise<Guest[]> {
    try {
      const token = authService.getToken();
      const guests = await apiService.listGuests(token);
      this.persistCache(guests);
      return guests;
    } catch {
      this.cache = this.readLocalCache();
      return this.cache;
    }
  }

  public getGuests(): Guest[] {
    return this.cache;
  }

  public getGuestByCode(code: string): Guest | undefined {
    const normalized = code.toLowerCase().trim();
    return this.cache.find(
      guest => guest.code.toLowerCase() === normalized || guest.id.toLowerCase() === normalized
    );
  }

  public updateGuestRSVP(
    guestId: string,
    status: GuestStatus,
    passesConfirmed: number,
    dietaryRestrictions?: string,
    notes?: string
  ): Promise<Guest | null> {
    return apiService
      .updateGuestRSVP(guestId, status, passesConfirmed, dietaryRestrictions, notes)
      .then(updatedGuest => {
        this.persistCache(this.cache.map(guest => (guest.id === updatedGuest.id ? updatedGuest : guest)));
        return updatedGuest;
      })
      .catch(() => {
        const index = this.cache.findIndex(guest => guest.id === guestId);
        if (index === -1) return null;

        this.cache[index] = {
          ...this.cache[index],
          status,
          passesConfirmed: status === 'confirmado' ? Math.min(passesConfirmed, this.cache[index].passesAllowed) : 0,
          dietaryRestrictions: dietaryRestrictions ?? this.cache[index].dietaryRestrictions ?? '',
          notes: notes ?? this.cache[index].notes ?? '',
          updatedAt: new Date().toISOString()
        };

        this.persistCache([...this.cache]);
        return this.cache[index];
      });
  }

  public addGuest(newGuest: Omit<Guest, 'id' | 'updatedAt'>): Promise<Guest> {
    const token = authService.getToken();
    if (!token) {
      const created: Guest = {
        ...newGuest,
        id: `gst-${Date.now().toString().slice(-4)}`,
        updatedAt: new Date().toISOString()
      };
      this.persistCache([created, ...this.cache]);
      return Promise.resolve(created);
    }

    return apiService.createGuest(token, newGuest).then(createdGuest => {
      this.persistCache([createdGuest, ...this.cache]);
      return createdGuest;
    });
  }

  public updateGuest(guest: Guest): Promise<Guest> {
    const token = authService.getToken();
    if (!token) {
      const updated = { ...guest, updatedAt: new Date().toISOString() };
      this.persistCache(this.cache.map(entry => (entry.id === updated.id ? updated : entry)));
      return Promise.resolve(updated);
    }

    return apiService.updateGuest(token, guest).then(updatedGuest => {
      this.persistCache(this.cache.map(entry => (entry.id === updatedGuest.id ? updatedGuest : entry)));
      return updatedGuest;
    });
  }

  public deleteGuest(guestId: string): Promise<void> {
    const token = authService.getToken();
    if (!token) {
      this.persistCache(this.cache.filter(guest => guest.id !== guestId));
      return Promise.resolve();
    }

    return apiService.deleteGuest(token, guestId).then(() => {
      this.persistCache(this.cache.filter(guest => guest.id !== guestId));
    });
  }

  public resetToDefault(): void {
    this.persistCache(INITIAL_GUESTS);
  }

  public exportToExcel(): void {
    const guests = this.getGuests();

    const headers = [
      'ID',
      'Código Invitado',
      'Nombre Invitado / Familia',
      'Categoría',
      'Pases Asignados',
      'Pases Confirmados',
      'Estado RSVP',
      'Teléfono / WhatsApp',
      'Correo Electrónico',
      'Restricciones Alimentarias',
      'Notas Especiales',
      'Última Actualización'
    ];

    const rows = guests.map(g => [
      `"${g.id}"`,
      `"${g.code}"`,
      `"${g.name.replace(/"/g, '""')}"`,
      `"${g.category}"`,
      g.passesAllowed,
      g.passesConfirmed,
      `"${g.status.toUpperCase()}"`,
      `"${g.phone || ''}"`,
      `"${g.email || ''}"`,
      `"${(g.dietaryRestrictions || '').replace(/"/g, '""')}"`,
      `"${(g.notes || '').replace(/"/g, '""')}"`,
      `"${new Date(g.updatedAt).toLocaleString('es-EC')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Lista_Invitados_Boda_Mateo_y_Camila_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public exportToPDF(): void {
    const guests = this.getGuests();
    const confirmedCount = guests.filter(g => g.status === 'confirmado').length;
    const totalPassesConfirmed = guests.reduce((acc, g) => acc + (g.status === 'confirmado' ? g.passesConfirmed : 0), 0);
    const totalPassesAllowed = guests.reduce((acc, g) => acc + g.passesAllowed, 0);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reporte Nupcial de Invitados — Mateo & Camila</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #1a1a1a; }
            h1 { font-size: 24px; color: #8a6d2b; margin-bottom: 5px; }
            h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #666; margin-bottom: 20px; }
            .stats { display: flex; gap: 20px; margin-bottom: 30px; }
            .card { background: #f9f8f6; padding: 15px 20px; border-radius: 8px; border: 1px solid #e2ded4; flex: 1; }
            .card-val { font-size: 22px; font-weight: bold; color: #2c2825; }
            .card-lbl { font-size: 11px; text-transform: uppercase; color: #777; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
            th { background: #2c2825; color: #ece8e1; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; }
            td { padding: 10px; border-bottom: 1px solid #eee; }
            tr:nth-child(even) { background: #fcfcfb; }
            .badge-confirmado { background: #d1fae5; color: #065f46; padding: 3px 8px; border-radius: 12px; font-weight: 600; font-size: 10px; }
            .badge-pendiente { background: #fef3c7; color: #92400e; padding: 3px 8px; border-radius: 12px; font-weight: 600; font-size: 10px; }
            .badge-declinado { background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 12px; font-weight: 600; font-size: 10px; }
            .footer { margin-top: 40px; font-size: 10px; text-align: center; color: #888; border-top: 1px solid #eee; padding-top: 15px; }
          </style>
        </head>
        <body>
          <h1>MATEO ANDRADE & CAMILA VITERI</h1>
          <h2>Reporte Oficial de Asistencia — Boda en Ambato 2026</h2>
          <div class="stats">
            <div class="card"><div class="card-val">${guests.length}</div><div class="card-lbl">Total Invitaciones</div></div>
            <div class="card"><div class="card-val">${confirmedCount} / ${guests.length}</div><div class="card-lbl">Invitados Confirmados</div></div>
            <div class="card"><div class="card-val">${totalPassesConfirmed} de ${totalPassesAllowed}</div><div class="card-lbl">Total Pases Confirmados</div></div>
            <div class="card"><div class="card-val">${Math.round((confirmedCount / guests.length) * 100)}%</div><div class="card-lbl">Porcentaje de Confirmación</div></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Invitado / Familia</th>
                <th>Categoría</th>
                <th>Pases</th>
                <th>Estado</th>
                <th>Contacto</th>
                <th>Restricciones</th>
              </tr>
            </thead>
            <tbody>
              ${guests.map(g => `
                <tr>
                  <td><strong>${g.name}</strong></td>
                  <td>${g.category}</td>
                  <td>${g.status === 'confirmado' ? `${g.passesConfirmed} de ${g.passesAllowed}` : `${g.passesAllowed} pases`}</td>
                  <td><span class="badge-${g.status}">${g.status.toUpperCase()}</span></td>
                  <td>${g.phone || 'N/A'}</td>
                  <td>${g.dietaryRestrictions || 'Sin especificación'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">Generado el ${new Date().toLocaleDateString('es-EC', { dateStyle: 'full' })} • Boda Mateo & Camila en Quinta Loren, Ambato</div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  public buildWhatsAppMessage(guest: Guest, appUrl: string): string {
    const phoneClean = (guest.phone || '').replace(/[^0-9]/g, '');
    const personalLink = `${appUrl}?invitado=${guest.code}`;
    const text = `¡Hola ${guest.name}! ✨\n\nCon mucha emoción, Mateo & Camila te invitan a su Boda en la hermosa ciudad de Ambato, Ecuador. 💍✨\n\n🗓️ Sábado, 14 de Noviembre de 2026\n⛪ Ceremonia: Catedral de Ambato (16:30 PM)\n🥂 Recepción: Quinta Loren (19:00 PM)\n\nPuedes ver tu invitación personalizada y confirmar tus ${guest.passesAllowed} pases en el siguiente enlace:\n👉 ${personalLink}\n\n¡Nos hará muy felices compartir este día tan especial contigo! ❤️`;

    return `https://wa.me/${phoneClean}?text=${encodeURIComponent(text)}`;
  }
}

export const storageService = new StorageService();
