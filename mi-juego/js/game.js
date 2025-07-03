// --- js/game.js ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener elementos del DOM
    const avatarSelectionScreen = document.getElementById('avatar-selection');
    const gamePlayScreen = document.getElementById('game-play-screen');
    const welcomeMessage = document.getElementById('welcome-message');

    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.classList.remove('hidden');
        gameContainer.classList.add('fade-in');
    }

    const avatarOptions = document.querySelectorAll('.avatar-option');
    const playerNameInput = document.getElementById('player-name');
    const startGameButton = document.getElementById('start-game');

    // Elementos de la pantalla del juego/preguntas
    const questionContainer = document.getElementById('question-container');
    const questionCounter = document.getElementById('question-counter');
    const livesCounter = document.getElementById('lives-counter');
    const videoExplanation = document.getElementById('video-explanation');
    const questionVideoElement = document.getElementById('question-video');
    const currentQuestionText = document.getElementById('current-question-text');
    const answersGrid = document.getElementById('answers-area'); // Este será el contenedor principal para respuestas (botones o input)

    const subQuestionArea = document.getElementById('sub-question-area');
    const subQuestionText = document.getElementById('sub-question-text');
    const subAnswersArea = document.getElementById('sub-answers-area');

    // Elementos de la pantalla de Nivel Completado
    const levelCompleteScreen = document.getElementById('level-complete-message');
    const levelScore = document.getElementById('level-score');
    const proceedToNextLevelButton = document.getElementById('proceed-to-next-level');
    const countdownMessage = document.getElementById('countdown-message');
    const countdownTimer = document.getElementById('countdown-timer');

    // Elementos de la pantalla de Game Over
    const gameOverScreen = document.getElementById('game-over-screen');
    const gameOverPlayerName = document.getElementById('game-over-player-name');
    const restartGameButton = document.getElementById('restart-game-button');
    const gameOverScoreDisplay = document.getElementById('game-over-score');

    // Variables de estado del juego
    let selectedAvatar = null;
    let playerName = '';
    let currentLevel = 1;
    let currentQuestionIndex = 0;
    let lives = 5;
    let score = 0; // Score acumulado del juego
    let correctAnswersInCurrentLevel = 0; // Contador de preguntas completamente correctas en el nivel actual

    // Total de niveles definidos en el juego
    const totalLevels = 2;

    let selectedAssociationOptions = {
        main: [],
        sub: []
    };

    // --- Estructura de Preguntas por Nivel ---
    const gameQuestions = {
        level1: [
            {
                type: "video",
                videoSrc: 'images/video_explicativo_1.mp4',
                question: "Un campo semántico está formado por un conjunto de palabras que comparten algún rasgo de___________, es decir, que tienen alguna __________en común.",
                options: [
                    { text: "a. Significado-referencia", isCorrect: false },
                    { text: "b. Semejanza-singularidad", isCorrect: false },
                    { text: "c. Significado-característica", isCorrect: true },
                    { text: "d. Semejanza-particularidad", isCorrect: false }
                ]
            },
            {
                type: "video",
                videoSrc: 'images/video_explicativo_2.mp4',
                question: "¿Cuál de las siguientes afirmaciones es correcta sobre el campo léxico?",
                options: [
                    { text: "a) Solo está compuesto por sustantivos que tienen un significado similar.", isCorrect: false },
                    { text: "b) Agrupa palabras con la misma raíz etimológica, sin importar su significado.", isCorrect: false },
                    { text: "c) Se refiere a palabras que riman entre sí para fortalecer el vocabulario.", isCorrect: false },
                    { text: "d) Es un conjunto de palabras de diferentes clases (sustantivos, verbos, adjetivos...) relacionadas con un mismo tema.", isCorrect: true }
                ]
            },
            {
                type: "video",
                videoSrc: 'images/video_explicativo_3.mp4',
                question: "Lo esencial que define a una familia léxica es: ",
                options: [
                    { text: "a) Compartir el mismo lexema o raíz.", isCorrect: true },
                    { text: "b) Pertenecer a la misma categoría gramatical.", "isCorrect": false },
                    { text: "c) Estar relacionadas por un tema específico.", isCorrect: false },
                    { text: "d) Usarse juntas frecuentemente en un contexto.", isCorrect: false }
                ]
            }
        ],
        // --- INICIO DEL NIVEL 2 ---
        level2: [
            {
                type: "text_input",
                // Pregunta ajustada para 4 inputs y un campo semántico más conciso
                question: `Escriba cuatro elementos que pertenezcan al campo semántico'FRUTAS REDONDAS':`,
                
                correctAnswers: ["manzana", "platano", "fresa", "naranja", "pera", "kiwi", "mango", "uva", "sandía", "melón", "cereza", "papaya", "coco", "limón", "piña"], // Ampliado pero solo 4 serán evaluadas
                numInputs: 4 , // <-- Establecido a 4 inputs
            },
            {
                type: "text_input",
                // La pregunta ya estaba ajustada para 4 espacios/respuestas
                question: "Escriba cuatro elementos que pertenezcan al campo léxico de 'Escuela':",
                correctAnswers: ["morfología", "sintaxis", "semántica", "fonología", "lexicología", "gramática", "pragmática", "fonética"], // Ajustado
                numInputs: 4 // <-- Establecido a 4 inputs
            },
            {
                type: "text_input",
                // Pregunta ajustada para 4 espacios/respuestas
                question: "Identifica cuatro tipos de lenguaje no verbal: la __________ (movimientos corporales), la ___________ (uso del espacio personal), la __________ (uso de la voz), y la __________ (símbolos y signos).",
                correctAnswers: ["kinésica", "proxémica", "paralingüística", "semiótica", "apariencia", "háptica", "cronémica", "artefactos"], // Ajustado
                numInputs: 4 // <-- Establecido a 4 inputs
            }
        ], 
        // --- FIN DEL NIVEL 2 ---
    };

    // --- Funciones principales de lógica del juego ---

    const updateStartButtonState = () => {
        if (selectedAvatar && playerNameInput.value.trim() !== '') {
            startGameButton.disabled = false;
        } else {
            startGameButton.disabled = true;
        }
    };

    const updateLivesDisplay = () => {
        livesCounter.textContent = `Vidas: ${'❤️'.repeat(lives)}`;
        if (lives <= 0) {
            livesCounter.textContent = `Vidas: 💔`;
        }
    };

    const updateQuestionCounter = () => {
        const currentLevelQuestions = gameQuestions[`level${currentLevel}`];
        if (currentLevelQuestions && currentLevelQuestions.length > 0) {
            const questionNumber = currentQuestionIndex < currentLevelQuestions.length ? currentQuestionIndex + 1 : currentLevelQuestions.length;
            questionCounter.textContent = `Nivel ${currentLevel} - Pregunta ${questionNumber} / ${currentLevelQuestions.length}`;
        } else {
            questionCounter.textContent = `Nivel ${currentLevel} - Sin preguntas`;
        }
    };

    const loadQuestion = () => {
        const currentLevelQuestions = gameQuestions[`level${currentLevel}`];
        if (currentLevelQuestions && currentQuestionIndex < currentLevelQuestions.length) {
            gamePlayScreen.classList.remove('hidden', 'fade-out');
            gamePlayScreen.classList.add('fade-in');

            displayQuestion(currentLevelQuestions[currentQuestionIndex]);
            updateLivesDisplay();
            updateQuestionCounter();
        } else {
            showLevelCompleteScreen();
        }
    };

    const displayQuestion = (question) => {
        answersGrid.innerHTML = ''; // Limpia respuestas anteriores (botones o input)
        videoExplanation.classList.add('hidden'); // Oculta el contenedor de video por defecto
        subQuestionArea.classList.add('hidden'); // Oculta sub-pregunta por defecto
        subAnswersArea.innerHTML = ''; // Limpia sub-respuestas

        // Pausa y resetea el video si existe
        if (questionVideoElement) {
            questionVideoElement.pause();
            questionVideoElement.currentTime = 0;
            questionVideoElement.src = "";
        }

        // Muestra la pregunta según su tipo
        // **********************************************************************************
        // ATENCIÓN CRÍTICA: Aquí se diferencia si la pregunta es de tipo "video" (Nivel 1)
        // o "text_input" (Nivel 2). Esto es fundamental para que NO se mezclen las lógicas.
        // **********************************************************************************
        if (question.type === "video") { // Esto cubre el Nivel 1
            answersGrid.style.display = 'grid'; // Asegura que las opciones se muestren como grid
            answersGrid.style.flexDirection = ''; // Reset flex properties
            answersGrid.style.alignItems = '';
            answersGrid.style.gap = '10px'; // Restablecer el gap para grid

            if (questionVideoElement) {
                questionVideoElement.src = question.videoSrc;
                questionVideoElement.load();
                videoExplanation.classList.remove('hidden');
            }
            currentQuestionText.textContent = question.question;
            renderSimpleOptions(question.options); // Llama a la función para botones
        } else if (question.type === "text_input") { // Esto cubre el Nivel 2
            answersGrid.style.display = 'flex';
            answersGrid.style.flexDirection = 'column';
            answersGrid.style.justifyContent = 'center';
            answersGrid.style.alignItems = 'center';
            answersGrid.style.gap = '15px';

            currentQuestionText.textContent = question.question;
            renderTextInputArea(question.numInputs); // Llama a la función para inputs de texto
        }
        // Las preguntas de tipo "text" y "association_two_parts" no están en los niveles actuales,
        // pero se mantuvieron por si acaso para futuras expansiones, aunque ahora se han retirado
        // de la lógica principal para evitar confusiones y asegurar la correcta segregación.
        // if (question.type === "text") { /* ... */ }
        // if (question.type === "association_two_parts") { /* ... */ }
    };

    // Renderiza las opciones de respuesta como botones simples (USADO EXCLUSIVAMENTE POR NIVEL 1)
    const renderSimpleOptions = (options) => {
        options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('answer-button');
            button.textContent = option.text;
            button.dataset.correct = option.isCorrect;
            button.onclick = () => handleAnswer(button, option.isCorrect); // Llama a handleAnswer para botones
            answersGrid.appendChild(button);
        });
    };

    // Renderiza MÚLTIPLES campos de texto y un botón de enviar (USADO EXCLUSIVAMENTE POR NIVEL 2)
    const renderTextInputArea = (numInputsToCreate) => {
        const inputContainer = document.createElement('div');
        inputContainer.id = 'text-input-fields-container';
        answersGrid.appendChild(inputContainer);

        inputContainer.style.width = '100%';
        inputContainer.style.display = 'flex';
        inputContainer.style.flexDirection = 'column';
        inputContainer.style.alignItems = 'center';
        inputContainer.style.gap = '10px';

        let currentRow;
        for (let i = 0; i < numInputsToCreate; i++) {
            // Crea una nueva fila para cada par de inputs
            if (i % 2 === 0) {
                currentRow = document.createElement('div');
                currentRow.classList.add('text-input-row');
                inputContainer.appendChild(currentRow);
                currentRow.style.display = 'flex';
                currentRow.style.gap = '10px';
                currentRow.style.justifyContent = 'center';
                currentRow.style.width = '100%';
            }

            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.classList.add('text-answer-input');
            inputField.dataset.index = i;
            inputField.placeholder = `Respuesta ${i + 1}`;

            if (currentRow) {
                currentRow.appendChild(inputField);
            }
        }
        
        const submitButton = document.createElement('button');
        submitButton.id = 'submit-text-answer';
        submitButton.textContent = 'Enviar Respuestas';
        submitButton.classList.add('submit-text-button');
        answersGrid.appendChild(submitButton);

        submitButton.onclick = () => {
            const inputElements = document.querySelectorAll('.text-answer-input');
            const typedAnswers = Array.from(inputElements).map(input => input.value);
            handleTextInputAnswer(typedAnswers, gameQuestions[`level${currentLevel}`][currentQuestionIndex], inputElements, submitButton); // Llama a handleTextInputAnswer para inputs
        };

        // Permite enviar con Enter
        inputContainer.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                submitButton.click();
            }
        });

        // Enfocar el primer input al cargar
        if (numInputsToCreate > 0) {
            document.querySelector('.text-answer-input').focus();
        }
    };

    // Lógica de validación para las preguntas de text_input (APLICA SÓLO AL NIVEL 2)
    const handleTextInputAnswer = (typedAnswersArray, currentQuestionData, inputElements, submitButton) => {
        // Asegúrate de que esta lógica SOLO se ejecute para el Nivel 2
        if (currentLevel !== 2) {
            console.error("handleTextInputAnswer fue llamada para un nivel incorrecto (debería ser Nivel 2).");
            // Puedes agregar un manejo de error visual o simplemente salir
            lives--; // Penalizar por el error de llamada, o manejar de otra forma
            updateLivesDisplay();
            setTimeout(() => {
                if (lives <= 0) { showGameOverScreen(false); }
                else { currentQuestionIndex++; loadQuestion(); }
            }, 1500);
            return; // Salir de la función para evitar procesar incorrectamente
        }

        let allInputsCorrectOverall = true; // Indica si TODOS los inputs son correctos para esta pregunta
        let correctInputsThisQuestion = 0; // Para contar cuántos inputs individuales son correctos (para la puntuación)

        // Deshabilitar inputs y botón mientras se procesa la respuesta
        inputElements.forEach(input => input.disabled = true);
        submitButton.disabled = true;

        const feedbackMessages = []; 

        const availableCorrectAnswers = currentQuestionData.correctAnswers.map(ans => ans.trim().toLowerCase());
        const userAnswersNormalized = typedAnswersArray.map(ans => ans.trim().toLowerCase());
        
        // 1. Verificar campos vacíos
        if (userAnswersNormalized.some(ans => ans === "")) {
            allInputsCorrectOverall = false;
            feedbackMessages.push("Por favor, rellena todos los campos.");
        }

        // 2. Verificar duplicados en las respuestas del usuario (solo si no están vacías)
        const nonEmptyUserAnswers = userAnswersNormalized.filter(ans => ans !== "");
        const uniqueUserAnswers = new Set(nonEmptyUserAnswers);
        if (uniqueUserAnswers.size !== nonEmptyUserAnswers.length) {
            allInputsCorrectOverall = false;
            feedbackMessages.push("No se permiten respuestas duplicadas.");
        }

        // Crear una copia de las respuestas correctas disponibles para "consumirlas"
        let tempAvailableCorrectAnswers = [...availableCorrectAnswers]; 
        const individualInputCorrectness = new Array(inputElements.length).fill(false); // Para el feedback visual individual

        userAnswersNormalized.forEach((userAns, index) => {
            const foundIndex = tempAvailableCorrectAnswers.indexOf(userAns);
            if (foundIndex !== -1 && userAns !== "") { 
                individualInputCorrectness[index] = true; // Marcar este input como correcto individualmente
                tempAvailableCorrectAnswers.splice(foundIndex, 1); // Remover la respuesta de la lista para evitar que se use de nuevo
                correctInputsThisQuestion++; // Incrementar el contador de inputs correctos para la puntuación
            } else {
                individualInputCorrectness[index] = false; // Marcar este input como incorrecto
                allInputsCorrectOverall = false; // Si un solo input es incorrecto, la pregunta completa no es perfecta
            }
        });

        // Aplicar feedback visual a cada input (bordes y sombras)
        inputElements.forEach((input, index) => {
            if (individualInputCorrectness[index]) {
                input.style.borderColor = '#28a745'; // Verde para correcto
                input.style.boxShadow = '0 0 15px rgba(40, 167, 69, 0.8)';
            } else {
                input.style.borderColor = '#dc3545'; // Rojo para incorrecto
                input.style.boxShadow = '0 0 15px rgba(220, 53, 69, 0.8)';
            }
        });

        // PUNTUACIÓN Y GESTIÓN DE VIDAS PARA EL NIVEL 2
        score += correctInputsThisQuestion * 0.25; // Sumar 0.25 por cada input correcto individual

        if (allInputsCorrectOverall && feedbackMessages.length === 0) {
            // Si todos los inputs son correctos y no hay problemas de formato (vacío/duplicado)
            correctAnswersInCurrentLevel++; // Contar esta pregunta como "completamente correcta" para el nivel
            const existingFeedbackDiv = answersGrid.querySelector('.feedback-message');
            if (existingFeedbackDiv) {
                existingFeedbackDiv.remove();
            }
        } else {
            // Si hay algún input incorrecto, vacío o duplicado, se pierde una vida
            lives--; 
            updateLivesDisplay();

            let feedbackDiv = answersGrid.querySelector('.feedback-message');
            if (!feedbackDiv) {
                feedbackDiv = document.createElement('p');
                feedbackDiv.classList.add('feedback-message');
                answersGrid.appendChild(feedbackDiv);
            }
            
            if (feedbackMessages.length > 0) {
                // Mensajes específicos si hay vacíos o duplicados
                 feedbackDiv.textContent = `Algunas respuestas fueron incorrectas: ${feedbackMessages.join(' ')}`;
            } else if (correctInputsThisQuestion > 0) {
                // Si hay algunos correctos pero no todos
                feedbackDiv.textContent = `Has acertado ${correctInputsThisQuestion} de ${inputElements.length} campos.`;
            } else {
                // Si todos son incorrectos (y no hay mensajes de vacío/duplicado)
                feedbackDiv.textContent = `Todas las respuestas fueron incorrectas.`;
            }
        }

        // Después de dar feedback, pasar a la siguiente pregunta o mostrar pantalla de Game Over
        setTimeout(() => {
            if (lives <= 0) {
                showGameOverScreen(false); 
            } else {
                currentQuestionIndex++;
                loadQuestion(); 
            }
        }, 2500); // Esperar 2.5 segundos antes de pasar
    };

    // Funciones para manejo de preguntas de asociación (NO USADAS EN NIVELES ACTUALES)
    const toggleAssociationSelection = (button, optionText, section) => {
        button.classList.toggle('selected');

        const index = selectedAssociationOptions[section].indexOf(optionText);

        if (index > -1) {
            selectedAssociationOptions[section].splice(index, 1);
        } else {
            selectedAssociationOptions[section].push(optionText);
        }
    };

    const checkAssociationAnswer = () => {
        const currentQuestion = gameQuestions[`level${currentLevel}`][currentQuestionIndex];
        let overallCorrect = true;

        const mainSelected = selectedAssociationOptions.main.sort();
        const mainExpected = currentQuestion.mainCorrect.sort();

        if (mainSelected.length !== mainExpected.length || !mainSelected.every((val, index) => val === mainExpected[index])) {
            overallCorrect = false;
        }

        const subSelected = selectedAssociationOptions.sub.sort();
        const subExpected = currentQuestion.subCorrect.sort();

        if (subSelected.length !== subExpected.length || !subSelected.every((val, index) => val === subExpected[index])) {
            overallCorrect = false;
        }

        const allMainButtons = answersGrid.querySelectorAll('.answer-button');
        const allSubButtons = subAnswersArea.querySelectorAll('.answer-button');
        const combinedButtons = [...allMainButtons, ...allSubButtons];

        combinedButtons.forEach(button => {
            button.disabled = true;
            const optionText = button.dataset.optionText;
            const section = button.dataset.section;

            if (section === 'main') {
                if (currentQuestion.mainCorrect.includes(optionText)) {
                    button.classList.add('correct');
                } else if (selectedAssociationOptions.main.includes(optionText) && !currentQuestion.mainCorrect.includes(optionText)) {
                    button.classList.add('incorrect');
                }
            } else if (section === 'sub') {
                if (currentQuestion.subCorrect.includes(optionText)) {
                    button.classList.add('correct');
                } else if (selectedAssociationOptions.sub.includes(optionText) && !currentQuestion.subCorrect.includes(optionText)) {
                    button.classList.add('incorrect');
                }
            }
        });

        const confirmButton = document.getElementById('confirm-association-button');
        if (confirmButton) {
            confirmButton.disabled = true;
        }

        setTimeout(() => {
            if (overallCorrect) {
                score += 10; 
                currentQuestionIndex++;
                loadQuestion();
            } else {
                lives--;
                updateLivesDisplay();
                if (lives <= 0) {
                    showGameOverScreen(false);
                } else {
                    currentQuestionIndex++;
                    loadQuestion();
                }
            }
            selectedAssociationOptions.main = [];
            selectedAssociationOptions.sub = [];
        }, 1500);
    };

    // Maneja la respuesta a una pregunta de opción múltiple (USADO EXCLUSIVAMENTE POR NIVEL 1)
    const handleAnswer = (clickedButton, isCorrect) => {
        // Asegúrate de que esta lógica SOLO se ejecute para el Nivel 1
        if (currentLevel !== 1) {
            console.error("handleAnswer fue llamada para un nivel incorrecto (debería ser Nivel 1).");
            // Penalizar o manejar el error si ocurre
            lives--;
            updateLivesDisplay();
            setTimeout(() => {
                if (lives <= 0) { showGameOverScreen(false); }
                else { currentQuestionIndex++; loadQuestion(); }
            }, 1500);
            return; // Salir de la función
        }

        if (questionVideoElement) {
            questionVideoElement.pause();
        }

        answersGrid.querySelectorAll('.answer-button').forEach(btn => btn.disabled = true);

        if (isCorrect) {
            score += 10; // Puntuación de 10 puntos para preguntas de Nivel 1
            clickedButton.classList.add('correct');
            correctAnswersInCurrentLevel++; // Suma al contador de preguntas correctas del nivel
        } else {
            clickedButton.classList.add('incorrect');
            lives--;
            updateLivesDisplay();

            answersGrid.querySelectorAll('.answer-button').forEach(btn => {
                if (btn.dataset.correct === 'true') {
                    btn.classList.add('correct');
                }
            });
        }

        setTimeout(() => {
            if (lives <= 0) {
                showGameOverScreen(false);
            } else {
                currentQuestionIndex++;
                loadQuestion();
            }
        }, 1500);
    };

    // Función para mostrar la pantalla de nivel completado
    const showLevelCompleteScreen = () => {
        if (gamePlayScreen) gamePlayScreen.classList.add('fade-out');

        setTimeout(() => {
            if (gamePlayScreen) {
                gamePlayScreen.classList.add('hidden');
                gamePlayScreen.classList.remove('fade-out');
            }

            if (levelCompleteScreen) {
                levelCompleteScreen.classList.remove('hidden');
                levelCompleteScreen.classList.add('fade-in');
            }

            const currentLevelQuestions = gameQuestions[`level${currentLevel}`];
            if (levelScore) {
                levelScore.textContent = `Has respondido ${correctAnswersInCurrentLevel} de ${currentLevelQuestions.length} preguntas correctamente.`;
            }

            const levelCompleteTitle = levelCompleteScreen ? levelCompleteScreen.querySelector('h2') : null;
            if (levelCompleteTitle) {
                levelCompleteTitle.textContent = `¡Nivel ${currentLevel} Completado!`;
            }

            if (countdownMessage) {
                countdownMessage.classList.add('hidden');
            }

            if (proceedToNextLevelButton) {
                if (currentLevel < totalLevels) {
                    proceedToNextLevelButton.textContent = 'Continuar al Siguiente Nivel';
                    proceedToNextLevelButton.onclick = goToNextLevel;
                    proceedToNextLevelButton.classList.remove('hidden');
                } else {
                    proceedToNextLevelButton.textContent = 'Ver Resultados Finales';
                    proceedToNextLevelButton.onclick = () => showGameOverScreen(true);
                    proceedToNextLevelButton.classList.remove('hidden');
                }
            }
        }, 800);
    };

    // Función para avanzar al siguiente nivel
    const goToNextLevel = () => {
        if (levelCompleteScreen) levelCompleteScreen.classList.add('fade-out');

        setTimeout(() => {
            if (levelCompleteScreen) {
                levelCompleteScreen.classList.add('hidden');
                levelCompleteScreen.classList.remove('fade-out');
            }

            currentLevel++; 
            currentQuestionIndex = 0; 
            correctAnswersInCurrentLevel = 0; 

            loadQuestion(); 

        }, 800);
    };

    // Función para reiniciar el juego completamente
    const restartGameHandler = () => {
        if (gameOverScreen) gameOverScreen.classList.add('fade-out');
        if (levelCompleteScreen) levelCompleteScreen.classList.add('fade-out');

        setTimeout(() => {
            if (gameOverScreen) {
                gameOverScreen.classList.add('hidden');
                gameOverScreen.classList.remove('fade-out');
            }
            if (levelCompleteScreen) {
                levelCompleteScreen.classList.add('hidden');
                levelCompleteScreen.classList.remove('fade-out');
            }

            if (avatarSelectionScreen) {
                avatarSelectionScreen.classList.remove('hidden');
                avatarSelectionScreen.classList.add('fade-in');
            }

            playerNameInput.value = '';
            selectedAvatar = null;
            document.querySelectorAll('.avatars img').forEach(img => img.classList.remove('selected', 'avatar-focused', 'avatar-others'));
            updateStartButtonState();

            currentLevel = 1;
            currentQuestionIndex = 0;
            lives = 5;
            score = 0;
            correctAnswersInCurrentLevel = 0; 

            if (questionVideoElement) {
                questionVideoElement.src = '';
                questionVideoElement.load();
            }
            videoExplanation.classList.add('hidden');
            answersGrid.innerHTML = ''; 
            currentQuestionText.textContent = '';
            subQuestionArea.classList.add('hidden');
            subAnswersArea.innerHTML = '';

            if (proceedToNextLevelButton) {
                proceedToNextLevelButton.classList.add('hidden');
            }
            if (countdownMessage) {
                countdownMessage.classList.add('hidden');
            }

        }, 800);
    };

    // Función para mostrar la pantalla de Game Over (victoria o derrota)
    const showGameOverScreen = (isWin = false) => {
        if (gamePlayScreen) gamePlayScreen.classList.add('fade-out');
        if (levelCompleteScreen) levelCompleteScreen.classList.add('fade-out');

        setTimeout(() => {
            if (gamePlayScreen) {
                gamePlayScreen.classList.add('hidden');
                gamePlayScreen.classList.remove('fade-out');
            }
            if (levelCompleteScreen) {
                levelCompleteScreen.classList.add('hidden');
                levelCompleteScreen.classList.remove('fade-out');
            }

            if (gameOverScreen) {
                gameOverScreen.classList.remove('hidden');
                gameOverScreen.classList.add('fade-in');
            }

            if (gameOverPlayerName) {
                gameOverPlayerName.textContent = playerName;
            }
            if (gameOverScoreDisplay) {
                gameOverScoreDisplay.textContent = score;
            }

            const gameOverTitle = gameOverScreen ? gameOverScreen.querySelector('h2') : null;
            const gameOverMessage = gameOverScreen ? gameOverScreen.querySelector('p') : null;

            if (isWin) {
                if (gameOverTitle) gameOverTitle.textContent = `¡Felicidades, Explorador ${playerName}!`;
                if (gameOverMessage) gameOverMessage.innerHTML = `Has completado el Ascenso Cósmico con ${score} puntos y ${lives} vidas restantes.`;
            } else {
                if (gameOverTitle) gameOverTitle.textContent = `¡Fin del Ascenso, Explorador ${playerName}!`;
                if (gameOverMessage) gameOverMessage.innerHTML = `Tu puntuación final fue: <span id="game-over-score">${score}</span> puntos.<br>Te has quedado sin vidas.`;
            }

            if (restartGameButton) {
                restartGameButton.textContent = 'Reintentar Ascenso';
                restartGameButton.onclick = restartGameHandler;
            }
        }, 800);
    };

    // --- Event Listeners Iniciales ---

    updateStartButtonState(); 

    avatarOptions.forEach(avatar => {
        avatar.addEventListener('click', () => {
            avatarOptions.forEach(opt => opt.classList.remove('selected', 'avatar-focused', 'avatar-others'));
            avatar.classList.add('selected');
            selectedAvatar = avatar.dataset.avatar;
            avatarOptions.forEach(opt => {
                if (opt !== avatar) {
                    opt.classList.add('avatar-others');
                }
            });
            updateStartButtonState();
        });

        avatar.addEventListener('mouseenter', () => {
            avatarOptions.forEach(opt => {
                if (opt !== avatar && !opt.classList.contains('selected')) {
                    opt.classList.add('avatar-focused');
                }
            });
        });

        avatar.addEventListener('mouseleave', () => {
            avatarOptions.forEach(opt => {
                if (!opt.classList.contains('selected')) {
                    opt.classList.remove('avatar-others', 'avatar-focused');
                }
            });
        });
    });

    playerNameInput.addEventListener('input', () => {
        playerName = playerNameInput.value.trim();
        updateStartButtonState();
    });

    startGameButton.addEventListener('click', () => {
        if (selectedAvatar && playerName) {
            if (avatarSelectionScreen) avatarSelectionScreen.classList.add('fade-out');
            setTimeout(() => {
                if (avatarSelectionScreen) {
                    avatarSelectionScreen.classList.add('hidden');
                    avatarSelectionScreen.classList.remove('fade-out');
                }

                if (gamePlayScreen) {
                    gamePlayScreen.classList.remove('hidden');
                    gamePlayScreen.classList.add('fade-in');
                }

                if (welcomeMessage) {
                    welcomeMessage.textContent = `¡Bienvenido, Explorador ${playerName}! Tu Ascenso Cósmico comienza.`;
                }

                currentLevel = 1; // Reinicia el nivel a 1 al inicio del juego
                currentQuestionIndex = 0;
                lives = 5;
                score = 0;
                correctAnswersInCurrentLevel = 0; 

                loadQuestion();

            }, 800);
        } else {
            alert('Por favor, selecciona un avatar y/o ingresa tu nombre para iniciar el ascenso.');
        }
    });

});