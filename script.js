document.addEventListener('DOMContentLoaded', () => {
    // Elementi DOM
    const flagImg = document.getElementById('flag');
    const optionsContainer = document.getElementById('options-container');
    const openAnswerContainer = document.getElementById('open-answer-container');
    const openAnswerInput = document.getElementById('open-answer');
    const submitAnswerBtn = document.getElementById('submit-answer');
    const nextBtn = document.getElementById('next-btn');
    const resultText = document.getElementById('result');
    const themeSelect = document.getElementById('theme');
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    const mapContainer = document.getElementById('map-container');
    
    // Variabili di stato
    let countries = [];
    let currentCountry = {};
    let score = 0;
    let correctAnswers = 0;
    let totalQuestions = 0;
    let answerSubmitted = false;
    let map = null;

    // Suoni
    const correctSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3');
    const wrongSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3');

    // Inizializzazione
    init();

    async function init() {
        await fetchCountries();
        setupEventListeners();
    }

    async function fetchCountries() {
        try {
            const response = await fetch('https://restcountries.com/v3.1/all');
            countries = await response.json();
            newQuestion();
        } catch (error) {
            console.error("Errore nel caricamento dei paesi:", error);
            resultText.textContent = "Errore nel caricamento dei dati. Ricarica la pagina.";
            resultText.style.color = "red";
        }
    }

    function setupEventListeners() {
        themeSelect.addEventListener('change', changeTheme);
        
        modeRadios.forEach(radio => {
            radio.addEventListener('change', newQuestion);
        });

        submitAnswerBtn.addEventListener('click', handleOpenAnswer);
        openAnswerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !answerSubmitted) {
                handleOpenAnswer();
            }
        });

        nextBtn.addEventListener('click', newQuestion);
    }

    function changeTheme() {
        const theme = themeSelect.value;
        document.documentElement.setAttribute('data-theme', theme);
    }

    function newQuestion() {
        resetQuestionState();
        
        const randomCountries = getRandomCountries(4);
        currentCountry = randomCountries[Math.floor(Math.random() * randomCountries.length)];
        
        updateFlagDisplay();
        setupAnswerOptions(randomCountries);
    }

    function resetQuestionState() {
        answerSubmitted = false;
        resultText.textContent = '';
        nextBtn.style.display = 'none';
        optionsContainer.innerHTML = '';
        document.getElementById('country-info').style.display = 'none';
        mapContainer.style.display = 'none';
        openAnswerInput.disabled = false;
        submitAnswerBtn.disabled = false;
        openAnswerInput.value = '';
    }

    function updateFlagDisplay() {
        flagImg.src = currentCountry.flags.png;
        flagImg.alt = currentCountry.flags.alt || `Bandiera di ${currentCountry.name.common}`;
    }

    function setupAnswerOptions(randomCountries) {
        const mode = document.querySelector('input[name="mode"]:checked').value;
        
        if (mode === 'multiple') {
            optionsContainer.style.display = 'block';
            openAnswerContainer.style.display = 'none';
            
            randomCountries.forEach(country => {
                const button = document.createElement('button');
                button.textContent = country.name.common;
                button.addEventListener('click', () => checkAnswer(country));
                optionsContainer.appendChild(button);
            });
        } else {
            optionsContainer.style.display = 'none';
            openAnswerContainer.style.display = 'block';
            openAnswerInput.focus();
        }
    }

    function getRandomCountries(count) {
        const shuffled = [...countries].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    function handleOpenAnswer() {
        if (answerSubmitted) return;
        
        const userAnswer = openAnswerInput.value.trim();
        const matchedCountry = countries.find(c => 
            c.name.common.toLowerCase() === userAnswer.toLowerCase()
        );
        
        checkAnswer(matchedCountry || { name: { common: userAnswer } });
    }

    function checkAnswer(selectedCountry) {
        if (answerSubmitted) return;
        answerSubmitted = true;
        
        disableAnswerInputs(selectedCountry);
        updateScore(selectedCountry);
        showFeedback(selectedCountry);
        showNextQuestionButton();
    }

    function disableAnswerInputs(selectedCountry) {
        if (document.querySelector('input[name="mode"]:checked').value === 'multiple') {
            const allButtons = optionsContainer.querySelectorAll('button');
            allButtons.forEach(button => {
                button.disabled = true;
                if (button.textContent === currentCountry.name.common) {
                    button.classList.add('correct-highlight');
                } else if (button.textContent === selectedCountry.name.common && 
                          selectedCountry.name.common !== currentCountry.name.common) {
                    button.classList.add('wrong-highlight');
                }
            });
        } else {
            openAnswerInput.disabled = true;
            submitAnswerBtn.disabled = true;
        }
    }

    function updateScore(selectedCountry) {
        totalQuestions++;
        const isCorrect = selectedCountry.name.common === currentCountry.name.common;
        
        if (isCorrect) {
            score += 10;
            correctAnswers++;
        } else {
            score = Math.max(0, score - 5);
        }
        
        updateStats();
    }

    function showFeedback(selectedCountry) {
        const isCorrect = selectedCountry.name.common === currentCountry.name.common;
        
        if (isCorrect) {
            correctSound.play();
            resultText.textContent = 'Corretto!';
            resultText.style.color = 'green';
            flagImg.classList.add('correct-answer');
        } else {
            wrongSound.play();
            resultText.textContent = `Sbagliato! La risposta corretta era ${currentCountry.name.common}.`;
            resultText.style.color = 'red';
            flagImg.classList.add('wrong-answer');
        }

        setTimeout(() => {
            flagImg.classList.remove('correct-answer', 'wrong-answer');
        }, 1000);

        showCountryInfo();
        showCountryOnMap();
    }

    function updateStats() {
        document.getElementById('score').textContent = score;
        document.getElementById('correct').textContent = correctAnswers;
        document.getElementById('total').textContent = totalQuestions;
        document.getElementById('percentage').textContent = 
            totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    }

    function showCountryInfo() {
        const infoDiv = document.getElementById('country-info');
        infoDiv.style.display = 'block';
        document.getElementById('flag-description').textContent = 
            currentCountry.flags.alt || "Nessuna descrizione disponibile";
        document.getElementById('area').textContent = 
            currentCountry.area ? currentCountry.area.toLocaleString() : "N/D";
        document.getElementById('population').textContent = 
            currentCountry.population ? currentCountry.population.toLocaleString() : "N/D";
    }

    function showCountryOnMap() {
        mapContainer.style.display = 'block';
        
        const latlng = currentCountry.latlng || 
                      (currentCountry.capitalInfo && currentCountry.capitalInfo.latlng) || 
                      [0, 0];
        
        if (!map) {
            map = L.map('map').setView(latlng, 4);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);
        } else {
            map.setView(latlng, 4);
        }
        
        L.marker(latlng).addTo(map)
            .bindPopup(`<b>${currentCountry.name.common}</b>`)
            .openPopup();
    }

    function showNextQuestionButton() {
        nextBtn.style.display = 'block';
    }
});