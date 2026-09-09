const questions = [
  {
    category: 'Visibility',
    text: 'How confident are you that every device, account and cloud service is inventoried?',
    options: [
      ['We have a current, centralized inventory', 20],
      ['Most items are tracked, but not consistently', 12],
      ['We rely on spreadsheets or tribal knowledge', 5],
      ['We do not have a reliable inventory', 0]
    ]
  },
  {
    category: 'Security',
    text: 'How broadly is multi-factor authentication enforced across the business?',
    options: [
      ['All critical systems and privileged accounts', 20],
      ['Microsoft 365 and a few key systems', 12],
      ['Only for some employees', 5],
      ['It is not consistently required', 0]
    ]
  },
  {
    category: 'Recovery',
    text: 'When was your last verified recovery test for business-critical data?',
    options: [
      ['Within the last 90 days', 20],
      ['Within the last year', 12],
      ['More than a year ago', 5],
      ['We have backups, but have never tested recovery', 0]
    ]
  },
  {
    category: 'Operations',
    text: 'What happens when an employee reports an IT issue?',
    options: [
      ['A documented service desk process with clear ownership', 20],
      ['Email or chat reaches a known IT contact', 12],
      ['The employee finds whoever can help', 5],
      ['There is no consistent process', 0]
    ]
  },
  {
    category: 'Strategy',
    text: 'How often are technology risks, lifecycle and budget reviewed with leadership?',
    options: [
      ['Quarterly, with a documented roadmap', 20],
      ['Annually during budgeting', 12],
      ['Only before a major purchase or problem', 5],
      ['There is no regular review', 0]
    ]
  }
];

const state = { step: 0, answers: Array(questions.length).fill(null) };
const questionView = document.querySelector('[data-question-view]');
const resultView = document.querySelector('[data-result-view]');
const progress = document.querySelector('[data-progress]');

function renderQuestion() {
  const question = questions[state.step];
  progress.innerHTML = questions.map((_, index) => `<i class="${index <= state.step ? 'active' : ''}"></i>`).join('');
  questionView.innerHTML = `
    <div class="question-meta"><span>${question.category}</span><span>${state.step + 1} of ${questions.length}</span></div>
    <h2>${question.text}</h2>
    <div class="options">
      ${question.options.map(([label, score], index) => `
        <button class="option ${state.answers[state.step] === index ? 'selected' : ''}" type="button" data-option="${index}" data-score="${score}">
          <span class="option-dot" aria-hidden="true"></span><span>${label}</span>
        </button>`).join('')}
    </div>
    <div class="question-actions">
      <button class="button button-ink" type="button" data-back ${state.step === 0 ? 'disabled' : ''}>Back</button>
      <button class="button button-primary" type="button" data-next ${state.answers[state.step] === null ? 'disabled' : ''}>${state.step === questions.length - 1 ? 'See my score' : 'Next question'}</button>
    </div>`;

  questionView.querySelectorAll('[data-option]').forEach((button) => {
    button.addEventListener('click', () => {
      state.answers[state.step] = Number(button.dataset.option);
      renderQuestion();
    });
  });
  questionView.querySelector('[data-back]').addEventListener('click', () => {
    if (state.step > 0) { state.step -= 1; renderQuestion(); }
  });
  questionView.querySelector('[data-next]').addEventListener('click', () => {
    if (state.answers[state.step] === null) return;
    if (state.step < questions.length - 1) { state.step += 1; renderQuestion(); }
    else renderResult();
  });
}

function renderResult() {
  const score = state.answers.reduce((sum, answer, index) => sum + questions[index].options[answer][1], 0);
  const level = score >= 80 ? 'Resilient foundation' : score >= 55 ? 'Progress with exposure' : 'Priority risks identified';
  const priorities = questions
    .map((question, index) => ({ category: question.category, score: question.options[state.answers[index]][1] }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
  const descriptions = {
    Visibility: 'Create one reliable inventory for devices, identities, vendors and renewal dates.',
    Security: 'Enforce MFA, remove standing admin rights and document a practical incident response path.',
    Recovery: 'Run a timed restore test and define acceptable recovery targets with leadership.',
    Operations: 'Introduce one intake channel, ownership rules and service reporting.',
    Strategy: 'Build a 12-month technology roadmap tied to business risk and budget.'
  };

  questionView.hidden = true;
  progress.hidden = true;
  resultView.classList.add('visible');
  resultView.innerHTML = `
    <div class="result-head">
      <div class="result-score"><strong>${score}</strong><span>out of 100</span></div>
      <div><p class="eyebrow">Your result</p><h2>${level}</h2><p class="muted">This directional score highlights where a focused conversation would create the most value.</p></div>
    </div>
    <div class="recommendations">
      ${priorities.map((item, index) => `<div class="recommendation"><strong>0${index + 1} · ${item.category}</strong><span>${descriptions[item.category]}</span></div>`).join('')}
    </div>
    <div class="question-actions">
      <button class="button button-ink" type="button" data-restart>Retake assessment</button>
      <a class="button button-primary" href="/#contact">Discuss the roadmap</a>
    </div>
    <p class="demo-note">Concept demo: answers stay in your browser and are not transmitted or stored.</p>`;
  resultView.querySelector('[data-restart]').addEventListener('click', () => {
    state.step = 0;
    state.answers.fill(null);
    resultView.classList.remove('visible');
    resultView.innerHTML = '';
    questionView.hidden = false;
    progress.hidden = false;
    renderQuestion();
  });
}

if (questionView && resultView && progress) renderQuestion();
