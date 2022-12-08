import {
    getFirestore,
    doc,
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


}

export default Game;