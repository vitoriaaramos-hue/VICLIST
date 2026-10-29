/**
 * Orbit - Canvas Charts Engine
 * Gráficos leves, responsivos e nítidos em HTML5 Canvas nativo
 */

const Charts = {
  renderWeeklyChart(canvasId, tasks) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 500;
    const height = 240;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Compute last 7 days data
    const days = [];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const completedCount = tasks.filter(t => t.completedAt === dateStr).length;
      const createdCount = tasks.filter(t => t.createdAt === dateStr).length;

      days.push({
        label: dayNames[d.getDay()],
        completed: completedCount,
        created: createdCount
      });
    }

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 25, right: 25, bottom: 35, left: 35 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(5, ...days.map(d => Math.max(d.completed, d.created)));

    const isDark = document.body.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

    // Grid lines & Y axis
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
      const val = Math.round((maxVal / yTicks) * i);
      const y = padding.top + chartH - (i / yTicks) * chartH;
      ctx.fillText(val.toString(), padding.left - 8, y);

      ctx.beginPath();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
    }

    const stepX = chartW / (days.length - 1);

    // Draw Created tasks line (dashed gray)
    ctx.beginPath();
    ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);

    days.forEach((d, idx) => {
      const x = padding.left + idx * stepX;
      const y = padding.top + chartH - (d.created / maxVal) * chartH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Completed tasks area & line (vibrant indigo)
    const points = days.map((d, idx) => ({
      x: padding.left + idx * stepX,
      y: padding.top + chartH - (d.completed / maxVal) * chartH
    }));

    // Area gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartH);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Solid stroke line
    ctx.beginPath();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    points.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Points dots and X labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = textColor;

    points.forEach((p, idx) => {
      // Point circle
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f1';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isDark ? '#1e293b' : '#ffffff';
      ctx.stroke();

      // X Label
      ctx.fillStyle = textColor;
      ctx.fillText(days[idx].label, p.x, padding.top + chartH + 10);
    });
  },

  renderPriorityChart(canvasId, tasks) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 400;
    const height = 240;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const counts = {
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };

    const categories = [
      { key: 'urgent', label: 'Urgente', color: '#ef4444', count: counts.urgent },
      { key: 'high', label: 'Alta', color: '#f59e0b', count: counts.high },
      { key: 'medium', label: 'Média', color: '#3b82f6', count: counts.medium },
      { key: 'low', label: 'Baixa', color: '#10b981', count: counts.low },
    ];

    ctx.clearRect(0, 0, width, height);

    const max = Math.max(5, ...categories.map(c => c.count));
    const padding = { top: 20, right: 30, bottom: 35, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const isDark = document.body.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#64748b';

    const barW = Math.min(48, (chartW / categories.length) * 0.55);
    const step = chartW / categories.length;

    categories.forEach((cat, idx) => {
      const x = padding.left + idx * step + (step - barW) / 2;
      const barH = (cat.count / max) * chartH;
      const y = padding.top + chartH - barH;

      // Draw Bar with rounded top
      ctx.fillStyle = cat.color;
      ctx.beginPath();
      const r = 6;
      ctx.moveTo(x, padding.top + chartH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, padding.top + chartH);
      ctx.closePath();
      ctx.fill();

      // Top count text
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillStyle = cat.color;
      ctx.textAlign = 'center';
      ctx.fillText(cat.count.toString(), x + barW / 2, y - 14);

      // Bottom label
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = textColor;
      ctx.fillText(cat.label, x + barW / 2, padding.top + chartH + 10);
    });
  }
};
