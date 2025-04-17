document.addEventListener('DOMContentLoaded', () => {
    // Elementi DOM
    const flagContainer = document.getElementById('flag-container');
    const flagImg = document.getElementById('flag');
    const optionsContainer = document.getElementById('options-container');
    const openAnswerContainer = document.getElementById('open-answer-container');
    const openAnswerInput = document.getElementById('open-answer');
    const submitAnswerBtn = document.getElementById('submit-answer');
    const nextBtn = document.getElementById('next-btn');
    const resultText = document.getElementById('result');
    const themeSelect = document.getElementById('theme');
    const themeStyle = document.getElementById('theme-style');
    const modeRadios = document.querySelectorAll('input[name="mode"]');

    // Variabili di stato
    let countries = [];
    let currentCountry = {};
    let score = 0;
    let correctAnswers = 0;
    let totalQuestions = 0;

    // Suoni
    const correctSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3');
    const wrongSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3');

    // Funzione per cambiare tema
    function changeTheme() {
        const theme = themeSelect.value;
        document.documentElement.setAttribute('data-theme', theme);
        
        if (theme === 'default') {
            themeStyle.href = '';
        } else {
            themeStyle.href = 'themes.css';
        }
    }

    // Fetch paesi dall'API
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

    // Genera nuova domanda
    function newQuestion() {
        resultText.textContent = '';
        nextBtn.style.display = 'none';
        optionsContainer.innerHTML = '';
        document.getElementById('country-info').style.display = 'none';

        const randomCountries = getRandomCountries(4);
        currentCountry = randomCountries[Math.floor(Math.random() * randomCountries.length)];

        flagImg.src = currentCountry.flags.png;
        flagImg.alt = currentCountry.flags.alt || `Bandiera di ${currentCountry.name.common}`;

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
            openAnswerInput.value = '';
            openAnswerInput.focus();
        }
    }

    // Ottieni paesi random
    function getRandomCountries(count) {
        const shuffled = [...countries].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // Controlla risposta
    function checkAnswer(selectedCountry) {
        totalQuestions++;
        const isCorrect = selectedCountry.name.common === currentCountry.name.common;
        
        // Feedback audio
        if (isCorrect) {
            correctSound.play();
            resultText.textContent = 'Corretto!';
            resultText.style.color = 'green';
            score += 10;
            correctAnswers++;
            flagImg.classList.add('correct-answer');
        } else {
            wrongSound.play();
            resultText.textContent = `Sbagliato! La risposta corretta era ${currentCountry.name.common}.`;
            resultText.style.color = 'red';
            score = Math.max(0, score - 5);
            flagImg.classList.add('wrong-answer');
        }

        // Rimuovi animazioni dopo 1 secondo
        setTimeout(() => {
            flagImg.classList.remove('correct-answer', 'wrong-answer');
        }, 1000);

        // Aggiorna statistiche
        updateStats();

        // Mostra informazioni aggiuntive
        showCountryInfo();

        nextBtn.style.display = 'block';
    }

    // Aggiorna statistiche
    function updateStats() {
        document.getElementById('score').textContent = score;
        document.getElementById('correct').textContent = correctAnswers;
        document.getElementById('total').textContent = totalQuestions;
        document.getElementById('percentage').textContent = 
            totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    }

    // Mostra informazioni paese
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

    // Event listeners
    themeSelect.addEventListener('change', changeTheme);
    
    modeRadios.forEach(radio => {
        radio.addEventListener('change', newQuestion);
    });

    submitAnswerBtn.addEventListener('click', () => {
        const userAnswer = openAnswerInput.value.trim();
        const matchedCountry = countries.find(c => 
            c.name.common.toLowerCase() === userAnswer.toLowerCase()
        );
        checkAnswer(matchedCountry || { name: { common: userAnswer } });
    });

    openAnswerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitAnswerBtn.click();
        }
    });

    nextBtn.addEventListener('click', newQuestion);

    // Inizializzazione
    changeTheme();
    fetchCountries();
});