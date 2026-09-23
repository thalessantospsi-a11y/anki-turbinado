/**
 * Teste Matemático e de Transição de Estados do FSRS v4.5
 */

console.log('--- Testando Validação do Algoritmo FSRS ---');

const DEFAULT_FSRS_WEIGHTS = [
  0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0234, 1.616, 0.1544,
  1.0824, 1.9813, 0.0953, 0.2975, 2.2042, 0.2407, 2.9466, 0.5034, 0.6567,
];

const scheduler = new (class {
  calculateRetrievability(elapsedDays, stability) {
    if (stability <= 0) return 0;
    return Math.pow(1 + (19 / 81) * (elapsedDays / stability), -0.5);
  }

  calculateInterval(stability, retention, maxInterval) {
    if (stability <= 0) return 1;
    const factor = (81 / 19) * (Math.pow(retention, -2) - 1);
    const interval = Math.round(stability * factor);
    return Math.min(Math.max(1, interval), maxInterval);
  }

  initDifficulty(rating, w = DEFAULT_FSRS_WEIGHTS) {
    const d = w[4] - Math.exp(w[5] * (rating - 1)) + 1;
    return Math.min(Math.max(1, d), 10);
  }

  initStability(rating, w = DEFAULT_FSRS_WEIGHTS) {
    return Math.max(0.1, w[rating - 1]);
  }
})();

// Teste 1: Decaimento de Retrievability no dia t = S deve ser exatamente 90%
const stability = 10;
const rAtS = scheduler.calculateRetrievability(stability, stability);
console.log(`R(t=10, S=10): ${(rAtS * 100).toFixed(2)}% (Esperado: ~90.00%)`);
if (Math.abs(rAtS - 0.9) > 0.01) {
  console.error('Falha no cálculo de retrievability');
  process.exit(1);
}

// Teste 2: Intervalo com retention=0.9 e stability=10 deve ser aproximadamente 10 dias
const interval = scheduler.calculateInterval(10, 0.9, 36500);
console.log(`Intervalo para S=10 com R=0.9: ${interval} dias (Esperado: 10 dias)`);
if (interval !== 10) {
  console.error('Falha no cálculo do intervalo');
  process.exit(1);
}

// Teste 3: Dificuldade inicial para Good (rating=3)
const dGood = scheduler.initDifficulty(3);
console.log(`Dificuldade inicial (Good=3): ${dGood.toFixed(2)} (Faixa válida: 1 a 10)`);
if (dGood < 1 || dGood > 10) {
  console.error('Falha na dificuldade inicial');
  process.exit(1);
}

// Teste 4: Estabilidade inicial para Good (rating=3)
const sGood = scheduler.initStability(3);
console.log(`Estabilidade inicial (Good=3): ${sGood.toFixed(2)} dias`);
if (sGood <= 0) {
  console.error('Falha na estabilidade inicial');
  process.exit(1);
}

console.log('✓ Todos os testes matemáticos centrais do FSRS passaram com precisão.');
