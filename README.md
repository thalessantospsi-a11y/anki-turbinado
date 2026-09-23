# ANKI TURBINADO ⚡
> *Sistema Operacional Completo de Aprendizagem de Alta Performance para Concursos Públicos, Residências e Exames*

O **ANKI TURBINADO** é uma plataforma que integra o algoritmo de repetição espaçada moderno **FSRS v4.5**, um **Banco de Questões com Caderno de Erros em loop ativo**, um **Tutor de Inteligência Artificial contextual (Google Gemini)** e ferramentas completas de **Simulados em Modo Prova Real**, **Planejamento de Carga Futura** e **Gamificação com Patentes de Concurso**.

---

## 🌟 Principais Recursos

1. **Repetição Espaçada FSRS v4.5:**
   - Modelagem de memória por Estabilidade ($S$), Dificuldade ($D$) e Retrievability ($R$) com 19 pesos otimizados.
   - 90% de retenção garantida na curva de esquecimento.
   - Suporte completo a cartões com texto simples, **Cloze deletion (`{{c1::termo}}`)**, múltipla escolha e verdadeiro/falso.

2. **Banco de Questões e Caderno de Erros:**
   - Filtros dinâmicos por banca examinadora, disciplina, assunto, ano e dificuldade.
   - Classificação diagnóstica da causa de cada erro (*Atenção*, *Pegadinha*, *Lacuna Teórica*, *Lei Seca*).
   - **Loop Ativo de Reforço:** Botão `[ ⚡ Gerar Card FSRS ]` que transforma qualquer erro em um flashcard atômico imediato.

3. **Modo Professor com IA (Google Gemini):**
   - Explicações socráticas, simplificação didática, mnemônicos e analogias práticas.
   - Extração automática de documentos em PDF/TXT/MD para criação de cartões atômicos com aprovação humana obrigatória.

4. **Simulados e Modo Prova Real:**
   - Ambiente estrito sem respostas reveladas antecipadamente para eliminar o viés de falsa familiaridade.
   - Cronômetro regressivo com alerta visual nos últimos 5 minutos e mapa matricial de questões com sinalizador de dúvidas (*flag*).
   - Relatório analítico pós-prova com gráficos de aproveitamento por disciplina e conversão direta dos erros.

5. **Planejamento, Metas & Previsão de Carga:**
   - Modo *"Hoje quero estudar X horas"*: distribuição algorítmica entre revisões pendentes, questões e novas cartas.
   - Gráfico de carga futura para 7, 14 e 30 dias com alertas preditivos contra sobrecarga.
   - Heatmap de consistência diária de 90 dias estilo GitHub e contador de ofensiva (*streak*).

6. **Gamificação Completa de Concurso:**
   - Patentes de concurseiro: *Calouro do Concurso*, *Estudante Focado*, *Rato de Biblioteca*, *Mestre da Lei Seca*, *Papa-Gabaritos* e *Quase Concursado / Nome no DOU*.
   - Sistema de recompensas em XP e galeria de insígnias desbloqueáveis.

7. **PWA e Suporte Offline:**
   - Aplicativo web progressivo instalável em celular e desktop.
   - Fila de sincronização local em **IndexedDB** que permite revisar sem internet e sincroniza com o Firestore assim que a conexão retornar.

---

## 🛠️ Stack Tecnológica

* **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
* **Backend & Banco de Dados:** Firebase Authentication, Cloud Firestore (com regras de segurança por usuário), IndexedDB (armazenamento local).
* **Inteligência Artificial:** Google Gemini AI via Server-Side Route Handlers com Structured Outputs (Zod).
* **Motor Cognitivo:** FSRS v4.5 em TypeScript puro.

---

## 📚 Documentação Técnica

Para detalhes aprofundados, consulte a documentação dedicada na pasta `docs/`:

* 🏛️ [**Arquitetura do Sistema**](docs/ARCHITECTURE.md): Fórmulas do FSRS v4.5, diagramas de dados do Firestore, máquina de estados e segurança.
* 🚀 [**Guia de Implantação / Deploy**](docs/DEPLOYMENT.md): Passo a passo para publicação na Vercel, Firebase Hosting e Docker.
* 📖 [**Guia Completo do Estudante**](docs/USER_GUIDE.md): Manual prático com dicas pedagógicas para concurseiros.

---

## 🚀 Como Iniciar Localmente

### 1. Clonar e Instalar Dependências
```bash
git clone https://github.com/seu-usuario/anki-turbinado.git
cd anki-turbinado
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo e preencha suas credenciais do Firebase e Gemini:
```bash
cp .env.example .env.local
```

### 3. Executar os Testes Unitários
O projeto possui suíte automatizada de testes para o motor FSRS, gamificação e planejador:
```bash
npm test
```

### 4. Executar em Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000` no seu navegador.

---

## 🛡️ Licença
Distribuído sob a licença MIT. Desenvolvido para transformar a rotina de estudos em aprovação comprovada.
