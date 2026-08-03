document.addEventListener('DOMContentLoaded', () => {
    const optionBtns = document.querySelectorAll('.option-btn');
    const checkBtn = document.getElementById('check-btn');
    const progressFill = document.getElementById('progress-fill');
    let selectedWords = [];

    // The correct translation (simplified for this MVP)
    const expectedAnswer = ["El", "rápido", "zorro", "marrón", "salta", "sobre", "el", "perro", "perezoso"];

    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('selected');
            const word = btn.dataset.value;
            
            if (btn.classList.contains('selected')) {
                selectedWords.push(word);
            } else {
                selectedWords = selectedWords.filter(w => w !== word);
            }

            // Enable check button if at least one word is selected
            if (selectedWords.length > 0) {
                checkBtn.disabled = false;
            } else {
                checkBtn.disabled = true;
            }
        });
    });

    checkBtn.addEventListener('click', () => {
        // Very basic validation: just check if the number of words selected matches
        if (selectedWords.length === expectedAnswer.length) {
            checkBtn.textContent = 'CONTINUE';
            checkBtn.classList.add('correct');
            progressFill.style.width = '40%';
            
            setTimeout(() => {
                alert('Correct! Great job!');
            }, 300);
        } else {
            checkBtn.textContent = 'RETRY';
            checkBtn.classList.add('incorrect');
            
            setTimeout(() => {
                checkBtn.textContent = 'CHECK';
                checkBtn.classList.remove('incorrect');
            }, 2000);
        }
    });
});
