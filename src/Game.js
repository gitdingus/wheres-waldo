import {
    getFirestore,
    doc,
    getDoc,
    getDocs,
    collection
} from 'firebase/firestore';

class Game {
    static async getGameboardsElement(app, callback) {
        const db = getFirestore(app);
        const gameboardsCollectionRef = collection(db, 'gameboards');
        const snapshot = await getDocs(gameboardsCollectionRef);
        const gameboardsDiv = document.createElement('div');

        gameboardsDiv.classList.add('gameboards');

        snapshot.forEach((gameboard) => {
            const gameboardData = gameboard.data();
            const gameboardDiv = document.createElement('div');
            const gameboardTitle = document.createElement('h2');
            const gameboardImg = document.createElement('img');

            gameboardDiv.classList.add('gameboard-preview');
            gameboardDiv.setAttribute('data-id', gameboard.id);
            gameboardDiv.addEventListener('click', (e) => {
                callback(gameboard.id);
            });

            gameboardTitle.textContent = gameboardData.title;
            gameboardImg.src = gameboardData.image;

            gameboardDiv.appendChild(gameboardImg);
            gameboardDiv.appendChild(gameboardTitle);

            gameboardsDiv.appendChild(gameboardDiv);
        });

        return gameboardsDiv;
    }

    static async getGameboard(app, id) {
        const db = getFirestore(app);
        const gameboardsCollection = collection(db, 'gameboards');
        const gameboardDoc = doc(gameboardsCollection, id);
        const snapshot = await getDoc(gameboardDoc);
        const gameboardData = snapshot.data();

        const gameboardDiv = document.createElement('div');
        const charactersDiv = document.createElement('div');
        const gameboardTitle = document.createElement('h1');
        const gameboardImage = document.createElement('img');

        gameboardDiv.classList.add('gameboard');
        charactersDiv.classList.add('characters');

        gameboardTitle.textContent = gameboardData.title;
        gameboardImage.src = gameboardData.image;

        gameboardData.characterNames.forEach((character) => {
            const characterP = document.createElement('p');
            characterP.textContent = character;

            charactersDiv.appendChild(characterP);
        });

        gameboardDiv.appendChild(gameboardTitle);
        gameboardDiv.appendChild(charactersDiv);
        gameboardDiv.appendChild(gameboardImage);

        return gameboardDiv;
    }

}

export default Game;