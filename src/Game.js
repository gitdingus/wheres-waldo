import {
    getFirestore,
    doc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
} from 'firebase/firestore';
import TargetingSystem from './TargetingSystem.js';
import Point from './Point.js';
import Character from './Character.js';
import Gameboard from './Gameboard.js';

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
        const characters = gameboardData.characterNames.map((characterName) => new Character(characterName));
        const gameboard = new Gameboard(gameboardData.image, characters);
        const gameboardDiv = document.createElement('div');
        const gameboardInfo = document.createElement('div');
        const charactersDiv = document.createElement('div');
        const gameboardTitle = document.createElement('h1');
        const gameboardImage = document.createElement('img');

        const targetingSystem = new TargetingSystem();
        const target = targetingSystem.getTarget();
        const characterSelectBox = targetingSystem.getCharacterList(characters);

        gameboardDiv.classList.add('gameboard');
        gameboardInfo.classList.add('gameboard-info');
        charactersDiv.classList.add('characters');

        gameboardTitle.textContent = gameboardData.title;
        gameboardImage.src = gameboardData.image;

        gameboardData.characterNames.forEach((character) => {
            const characterP = document.createElement('p');
            characterP.textContent = character;

            charactersDiv.appendChild(characterP);
        });

        gameboardInfo.appendChild(gameboardTitle);
        gameboardInfo.appendChild(charactersDiv);

        gameboardDiv.appendChild(target);
        gameboardDiv.appendChild(characterSelectBox);
        gameboardDiv.appendChild(gameboardInfo);
        gameboardDiv.appendChild(gameboardImage);

        gameboardImage.addEventListener('pointermove', (e) => {
            const point = new Point(e.pageX, e.pageY);
            target.drawTarget(point);
        });

        const gameboardClicked = (point) => {
            const clickedCoord = point;

            return async function (name) {
                const charactersCollection = collection(gameboardDoc, 'characters');
                const queryCharacters = query(
                    charactersCollection, 
                    where('name', '==', name),
                );
                const characterDocs = await getDocs(queryCharacters);
                
                characterDocs.forEach((character) => {
                    const coordinates = character.data().coordinates;

                    if (
                        point.getX() >= coordinates.x1 
                        && point.getX() <= coordinates.x2
                        && point.getY() >= coordinates.y1
                        && point.getY() <= coordinates.y2
                    ) {
                        const character = characters.find((character) => character.getName() === name);
                        character.setFound(true);

                        if (gameboard.allCharactersFound() === true) {
                            gameboardDiv.appendChild(Game.#popupMessage(`All characters have been found!!`, true, true));
                        } else {
                            gameboardDiv.appendChild(Game.#popupMessage(`Found ${name}!`, true));
                        }
                    } else {
                        gameboardDiv.appendChild(Game.#popupMessage('Keep looking!', false));
                    }
                });

            }
        }

        gameboardImage.addEventListener('click', (e) => {
            const pagePoint = new Point(e.pageX, e.pageY);
            const imagePoint = new Point(e.offsetX, e.offsetY);

            if (targetingSystem.getMode() === 'select') {
                characterSelectBox.hideCharacterList();
                target.drawTarget(pagePoint);
            } else {
                const characterSelectedCallback = gameboardClicked(imagePoint);
                characterSelectBox.drawCharacterList(pagePoint, characterSelectedCallback);
            }
        });



        return gameboardDiv;
    }

    static #popupMessage(text, positive = true, persistent = false) {
        const container = document.createElement('div');
        const messageDiv = document.createElement('div');

        container.classList.add('popup-message-container');
        container.classList.add(`${positive === true ? 'positive' : 'negative'}`);
        messageDiv.classList.add('message'); 

        messageDiv.textContent = text;

        container.appendChild(messageDiv);

        if (persistent === false) {
            setTimeout(() => { container.remove() }, 2000);
        }
        return container;
    
    }

}

export default Game;