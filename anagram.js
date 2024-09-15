let dictionary = [];

// Fetch the dictionary from a public domain source
fetch('https://raw.githubusercontent.com/lorenbrichter/Words/master/Words/en.txt')

    .then(response => response.text())
    .then(text => {
        dictionary = text.split('\n').map(word => word.trim().toLowerCase());
    })
    .catch(error => {
        console.error('Error fetching the dictionary:', error);
    });

function findAnagrams() {
    const input = document.getElementById('inputWord').value.toLowerCase().replace(/[^a-z]/g, '');
    if (!input) {
        alert("Please enter a valid word.");
        return;
    }

    const inputLetterCounts = getLetterCounts(input);
    const anagrams = {};

    for (let word of dictionary) {
        if (word.length < 2) continue; // Skip words of length 1
        if (word.length > input.length) continue; // Skip words longer than input

        const wordLetterCounts = getLetterCounts(word);
        if (canFormWord(inputLetterCounts, wordLetterCounts)) {
            if (!anagrams[word.length]) {
                anagrams[word.length] = [];
            }
            if (!anagrams[word.length].includes(word)) {
                anagrams[word.length].push(word);
            }
        }
    }

    displayResults(anagrams);
}

function getLetterCounts(word) {
    const counts = {};
    for (let letter of word) {
        counts[letter] = (counts[letter] || 0) + 1;
    }
    return counts;
}

function canFormWord(inputCounts, wordCounts) {
    for (let letter in wordCounts) {
        if (!inputCounts[letter] || inputCounts[letter] < wordCounts[letter]) {
            return false;
        }
    }
    return true;
}

function displayResults(anagrams) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    document.getElementById('definition').innerHTML = '';

    const lengths = Object.keys(anagrams).map(Number).sort((a, b) => b - a);
    if (lengths.length === 0) {
        resultsDiv.innerHTML = '<p>No anagrams found.</p>';
        return;
    }

    const table = document.createElement('table');

    for (let length of lengths) {
        const row = document.createElement('tr');
        const lengthCell = document.createElement('th');
        lengthCell.textContent = `Words of length ${length}`;
        row.appendChild(lengthCell);

        const wordsCell = document.createElement('td');
        for (let word of anagrams[length]) {
            const wordSpan = document.createElement('span');
            wordSpan.textContent = word;
            wordSpan.classList.add('word');
            wordSpan.onclick = () => showDefinition(word);
            wordsCell.appendChild(wordSpan);
            wordsCell.appendChild(document.createTextNode(', '));
        }
        // Remove the last comma and space
        wordsCell.removeChild(wordsCell.lastChild);
        row.appendChild(wordsCell);

        table.appendChild(row);
    }

    resultsDiv.appendChild(table);
}

function showDefinition(word) {
    const definitionDiv = document.getElementById('definition');
    definitionDiv.innerHTML = `<p>Loading definition for <strong>${word}</strong>...</p>`;

    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        .then(response => response.json())
        .then(data => {
            if (data.title === "No Definitions Found") {
                definitionDiv.innerHTML = `<p>No definition found for <strong>${word}</strong>.</p>`;
                return;
            }

            const meanings = data[0].meanings;
            let html = `<h2>${data[0].word}</h2>`;

            meanings.forEach(meaning => {
                html += `<h3>${meaning.partOfSpeech}</h3>`;
                meaning.definitions.forEach((def, index) => {
                    html += `<p>${index + 1}. ${def.definition}</p>`;
                });
            });

            definitionDiv.innerHTML = html;
        })
        .catch(error => {
            console.error('Error fetching the definition:', error);
            definitionDiv.innerHTML = `<p>Error fetching the definition for <strong>${word}</strong>.</p>`;
        });
}
