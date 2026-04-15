import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Génère et télécharge un PDF complet pour une Assemblée Générale.
 * Note : jsPDF ne supporte pas les emojis — on utilise du texte pur.
 */
export function generateAGPdf(ag, actionnaires = [], resolutions = []) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const GREEN = [17, 153, 142];
    const GREEN_LIGHT = [232, 253, 245];
    const DARK = [30, 41, 59];
    const GRAY = [100, 116, 139];
    const WHITE = [255, 255, 255];

    const fmt = (d) => d
        ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
        : '-';
    const pageW = doc.internal.pageSize.getWidth();

    // ── EN-TETE ──────────────────────────────────────────────────
    doc.setFillColor(...GREEN);
    doc.rect(0, 0, pageW, 38, 'F');

    doc.setTextColor(...WHITE);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Proces-Verbal', 14, 16);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Assemblee Generale', 14, 24);

    // Badge entreprise (droite)
    const entrepriseLabel = ag.entrepriseNom || '-';
    const badgeW = doc.getTextWidth(entrepriseLabel) + 10;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(255, 255, 255);
    doc.roundedRect(pageW - 14 - badgeW, 9, badgeW, 11, 3, 3, 'FD');
    doc.setTextColor(...GREEN);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(entrepriseLabel, pageW - 14 - badgeW / 2, 16, { align: 'center' });

    // Date generation
    doc.setTextColor(200, 240, 235);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Genere le ' + fmt(new Date().toISOString()), pageW - 14, 33, { align: 'right' });

    // ── TITRE AG ────────────────────────────────────────────────
    let y = 48;

    doc.setTextColor(...DARK);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text(ag.titre || 'Assemblee Generale', 14, y);
    y += 7;

    doc.setDrawColor(...GREEN);
    doc.setLineWidth(0.8);
    doc.line(14, y, pageW - 14, y);
    y += 7;

    // ── GRILLE INFOS (2 colonnes) ────────────────────────────────
    const infos = [
        ['Date', fmt(ag.date)],
        ['Lieu', ag.lieu || '-'],
        ['Entreprise', ag.entrepriseNom || '-'],
        ['Description', ag.description || '-'],
    ];

    doc.setFontSize(8.5);
    const colW = (pageW - 28) / 2 - 4;

    infos.forEach(([label, value], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const colX = 14 + col * (colW + 8);
        const rowY = y + row * 14;

        doc.setFillColor(...GREEN_LIGHT);
        doc.roundedRect(colX, rowY - 3, colW, 11, 2, 2, 'F');

        doc.setTextColor(...GRAY);
        doc.setFont('helvetica', 'bold');
        doc.text(label + ' :', colX + 3, rowY + 4);

        doc.setTextColor(...DARK);
        doc.setFont('helvetica', 'normal');
        const maxValW = colW - doc.getTextWidth(label + ' :') - 8;
        const lines = doc.splitTextToSize(String(value), maxValW);
        doc.text(lines[0] || '-', colX + doc.getTextWidth(label + ' :') + 6, rowY + 4);
    });

    y += Math.ceil(infos.length / 2) * 14 + 6;

    // ── ACTIONNAIRES ─────────────────────────────────────────────
    const agActionnaires = actionnaires.filter(
        a => String(a.entrepriseId) === String(ag.entrepriseId)
    );
    const rows = agActionnaires.length > 0 ? agActionnaires : (ag.actionnaires || []);
    const presentsIds = ag.actionnairesPresentsIds || [];
    const totalActions = rows.reduce((s, a) => s + (a.nombreActions || 0), 0);
    const totalPresents = rows
        .filter(a => presentsIds.length === 0 || presentsIds.includes(a.id))
        .reduce((s, a) => s + (a.nombreActions || 0), 0);
    const quorumStr = totalActions > 0
        ? 'Quorum : ' + ((totalPresents / totalActions) * 100).toFixed(1) + '% des actions'
        : '';

    // Header section
    doc.setFillColor(...GREEN);
    doc.roundedRect(14, y, pageW - 28, 9, 2, 2, 'F');
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('ACTIONNAIRES', 18, y + 6);
    if (quorumStr) doc.text(quorumStr, pageW - 16, y + 6, { align: 'right' });
    y += 13;

    if (rows.length === 0) {
        doc.setTextColor(...GRAY);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text('Aucun actionnaire enregistre.', 14, y + 5);
        y += 14;
    } else {
        autoTable(doc, {
            startY: y,
            margin: { left: 14, right: 14 },
            head: [['Nom', 'Prenom', 'Username', 'Nb. Actions', '% Capital', 'Presence']],
            body: rows.map(a => {
                const pct = totalActions > 0
                    ? ((a.nombreActions / totalActions) * 100).toFixed(1) + '%'
                    : '-';
                const isPresent = presentsIds.length === 0 || presentsIds.includes(a.id);
                return [
                    a.userNom || '-',
                    a.userPrenom || '-',
                    a.username || '-',
                    (a.nombreActions || 0).toLocaleString('fr-FR'),
                    pct,
                    isPresent ? 'Present' : 'Absent',
                ];
            }),
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: {
                fillColor: GREEN_LIGHT,
                textColor: GREEN,
                fontStyle: 'bold',
                fontSize: 8,
            },
            alternateRowStyles: { fillColor: [250, 252, 250] },
            columnStyles: { 5: { halign: 'center', fontStyle: 'bold' } },
            didParseCell(data) {
                if (data.column.index === 5 && data.section === 'body') {
                    data.cell.styles.textColor = data.cell.raw === 'Present'
                        ? [5, 95, 70]
                        : [153, 27, 27];
                }
            },
        });
        y = doc.lastAutoTable.finalY + 10;
    }

    // ── RESOLUTIONS ───────────────────────────────────────────────
    const agResolutions = (ag.resolutions && ag.resolutions.length > 0)
        ? ag.resolutions
        : resolutions.filter(r => String(r.entrepriseId) === String(ag.entrepriseId));

    if (y > 230) { doc.addPage(); y = 20; }

    doc.setFillColor(...GREEN);
    doc.roundedRect(14, y, pageW - 28, 9, 2, 2, 'F');
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('RESOLUTIONS', 18, y + 6);
    doc.text(
        agResolutions.length + ' resolution' + (agResolutions.length > 1 ? 's' : ''),
        pageW - 16, y + 6, { align: 'right' }
    );
    y += 13;

    if (agResolutions.length === 0) {
        doc.setTextColor(...GRAY);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text('Aucune resolution associee.', 14, y + 5);
        y += 14;
    } else {
        autoTable(doc, {
            startY: y,
            margin: { left: 14, right: 14 },
            head: [['#', 'Titre', 'Description']],
            body: agResolutions
                .sort((a, b) => (a.ordre || 0) - (b.ordre || 0))
                .map(r => [
                    r.ordre || '-',
                    r.titre || '-',
                    r.description || '-',
                ]),
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: {
                fillColor: GREEN_LIGHT,
                textColor: GREEN,
                fontStyle: 'bold',
                fontSize: 8,
            },
            alternateRowStyles: { fillColor: [250, 252, 250] },
            columnStyles: {
                0: { halign: 'center', cellWidth: 12 },
                1: { cellWidth: 55 },
                2: { cellWidth: 'auto' },
            },
        });
    }

    // ── PIED DE PAGE ─────────────────────────────────────────────
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        const ph = doc.internal.pageSize.getHeight();
        doc.setFillColor(...GREEN);
        doc.rect(0, ph - 12, pageW, 12, 'F');
        doc.setTextColor(...WHITE);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text('AG Vote - Systeme de gestion des Assemblees Generales', 14, ph - 4.5);
        doc.text('Page ' + p + ' / ' + totalPages, pageW - 14, ph - 4.5, { align: 'right' });
    }

    // ── TELECHARGEMENT ───────────────────────────────────────────
    const filename = 'AG_' + (ag.titre || 'rapport').replace(/\s+/g, '_') + '_' + (ag.id || '') + '.pdf';
    doc.save(filename);
}
