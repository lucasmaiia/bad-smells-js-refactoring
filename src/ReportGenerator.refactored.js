// ─── Constantes de Negócio (Smell corrigido: Magic Numbers) ──────────────────
const PRIORITY_THRESHOLD = 1000;
const USER_VALUE_LIMIT = 500;

// ─── Estratégias de Formatação (Smell corrigido: Repeated Switch) ─────────────
// Técnica: Replace Conditional with Polymorphism
// Cada classe encapsula TODA a lógica de um formato, eliminando os 4 blocos
// if(reportType === ...) que estavam espalhados pelo método original.

class CsvFormatter {
  buildHeader() {
    return 'ID,NOME,VALOR,USUARIO\n';
  }

  buildRow(item, user) {
    return `${item.id},${item.name},${item.value},${user.name}\n`;
  }

  buildFooter(total) {
    return `\nTotal,,\n${total},,\n`;
  }
}

class HtmlFormatter {
  buildHeader(user) {
    return (
      '<html><body>\n' +
      '<h1>Relatório</h1>\n' +
      `<h2>Usuário: ${user.name}</h2>\n` +
      '<table>\n' +
      '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n'
    );
  }

  buildRow(item) {
    const style = item.priority ? ' style="font-weight:bold;"' : '';
    return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
  }

  buildFooter(total) {
    return `</table>\n<h3>Total: ${total}</h3>\n</body></html>\n`;
  }
}

// ─── Classe Principal ─────────────────────────────────────────────────────────
export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  /**
   * Gera um relatório de itens baseado no tipo e no usuário.
   * Técnica: Extract Method — cada responsabilidade foi extraída para
   * métodos privados ou classes separadas.
   */
  generateReport(reportType, user, items) {
    const formatter = this._getFormatter(reportType);
    const visibleItems = this._filterItemsByRole(items, user);

    let report = formatter.buildHeader(user);
    let total = 0;

    for (const item of visibleItems) {
      // Smell corrigido: Mutação de Parâmetro
      // Usamos spread para criar um novo objeto ao invés de modificar o original.
      const isPriority = user.role === 'ADMIN' && item.value > PRIORITY_THRESHOLD;
      const enrichedItem = { ...item, priority: isPriority };

      report += formatter.buildRow(enrichedItem, user);
      total += item.value;
    }

    report += formatter.buildFooter(total);
    return report.trim();
  }

  // Técnica: Extract Method — isola a lógica de seleção do formatador.
  // Smell corrigido: if(reportType) verificado apenas UMA vez.
  _getFormatter(reportType) {
    if (reportType === 'CSV') return new CsvFormatter();
    if (reportType === 'HTML') return new HtmlFormatter();
    throw new Error(`Tipo de relatório desconhecido: ${reportType}`);
  }

  // Técnica: Extract Method + Decompose Conditional
  // Smell corrigido: Código Duplicado — a lógica de filtragem estava
  // duplicada dentro dos blocos ADMIN e USER do loop original.
  _filterItemsByRole(items, user) {
    if (user.role === 'ADMIN') return items;
    return items.filter((item) => item.value <= USER_VALUE_LIMIT);
  }
}
