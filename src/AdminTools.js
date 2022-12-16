import { getElementFromTemplateFile, appendChildren } from 'dom-utils';
import accessDenied from './template/no-access.template.html';
import addGameboardForm from './template/add-gameboard-form.template.html';
import Point from './Point.js';
import Box from './Box.js';
import Character from './Character.js';
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytes,
} from 'firebase/storage';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  writeBatch,
} from 'firebase/firestore';


class AdminTools {
  static getAccessDenied() {
    return getElementFromTemplateFile(accessDenied);
  }

  static getAddGameboardForm(app, auth) {
    const gameboardForm = getElementFromTemplateFile(addGameboardForm);
    const gameboardTitle = gameboardForm.querySelector('#gameboard-title');
    const gameboardImage = gameboardForm.querySelector('#gameboard-image');
    const addCharacterButton = gameboardForm.querySelector('#add-character-button');
    const characterName = gameboardForm.querySelector('#character-name');
    const characterImage = gameboardForm.querySelector('#character-image');
    const x1 = gameboardForm.querySelector('#x1');
    const y1 = gameboardForm.querySelector('#y1');
    const x2 = gameboardForm.querySelector('#x2');
    const y2 = gameboardForm.querySelector('#y2');
    const setPointOne = gameboardForm.querySelector('#set-point-one');
    const setPointTwo = gameboardForm.querySelector('#set-point-two');
    const characterList = gameboardForm.querySelector('.character-list');
    const gameboardPreview = gameboardForm.querySelector('#gameboard-preview');
    const characters = [];

    const addToCharacterList = (character) => {
      const characterDiv = document.createElement('div');
      const name = document.createElement('p');
      const createPreviewFromCoordinatesButton = document.createElement('button');
      const removeCharacterButton = document.createElement('button');
      const previewImage = document.createElement('canvas');

      createPreviewFromCoordinatesButton.type = 'button';
      removeCharacterButton.type = 'button';
      createPreviewFromCoordinatesButton.addEventListener('click', async (e) => {
        const coords = character.getCoordinates();
        const p1 = coords.getPointOne();
        const p2 = coords.getPointTwo();
        
        previewImage.width = `${p2.getX() - p1.getX()}`;
        previewImage.height = `${p2.getY() - p1.getY()}`;
        const ctx = previewImage.getContext('2d');
        let image = await createImageBitmap(
          gameboardPreview, 
          p1.getX(),
          p1.getY(),
          p2.getX() - p1.getX(),
          p2.getY() - p1.getY()
        );

        ctx.drawImage(image, 0, 0);
        previewImage.classList.add('show');
        character.canvasImage = previewImage;

      });
      characterDiv.classList.add('character');
      name.textContent = character.getName();
      createPreviewFromCoordinatesButton.textContent = 'Create preview from coordinates';
      removeCharacterButton.textContent = 'Remove Character';
      previewImage.src = character.getImage();

      appendChildren(
        characterDiv, 
        [
          previewImage,
          name,
          removeCharacterButton,
          createPreviewFromCoordinatesButton
        ]
      );

      characterList.appendChild(characterDiv);
    };

    gameboardImage.addEventListener('change', (e) => {
      const gameboardSrc = URL.createObjectURL(gameboardImage.files[0]);
      gameboardPreview.src = gameboardSrc;
    });

    characterImage.addEventListener('change', () => {
      alert('not yet operational, file won\'t be saved');
    })

    addCharacterButton.addEventListener('click', () => {
      const x1Num = Number.parseInt(x1.value);
      const y1Num = Number.parseInt(y1.value);
      const x2Num = Number.parseInt(x2.value);
      const y2Num = Number.parseInt(y2.value);
      const newBox = new Box(new Point(x1Num, y1Num), new Point(x2Num, y2Num));
      const newCharacter = new Character(characterName.value, newBox);

      characters.push(newCharacter);
      addToCharacterList(newCharacter);
    });

    const getPoint = (xBox, yBox) => {
      if (gameboardPreview.src === '') return;

      const coordListener = (e) => {
        xBox.value = e.offsetX;
        yBox.value = e.offsetY;
      };

      gameboardPreview.addEventListener('pointermove', coordListener);
      gameboardPreview.addEventListener('click', (e) => {
        gameboardPreview.removeEventListener('pointermove', coordListener);
      });
    };

    setPointOne.addEventListener('click', () => {
      getPoint(x1, y1);
    });

    setPointTwo.addEventListener('click', () => {
      getPoint(x2, y2);
    });

    const getExtension = (filename) => {
      const lastDot = filename.lastIndexOf('.');
      return filename.slice(lastDot+1);
    }

    const getGameboardImageURL = async () => {
      const firebaseStorage = getStorage(app);
      const storageRef = ref(firebaseStorage, `gameboards/${gameboardImage.files[0].name}`);
      const uploadResult = await uploadBytes(storageRef, gameboardImage.files[0]);
      const downloadUrl = await getDownloadURL(storageRef);

      return downloadUrl;
    }

    const getCharacterImageURL = async (character) => {
      console.log('in getCharacterImageURL');

      const firebaseStorage = getStorage(app);
      const newFilename = `${character.getName()}-preview.jpg`;
      const storageRef = ref(firebaseStorage, `gameboards/${gameboardTitle.value}/${newFilename}`);
      const getFile = await new Promise((resolve, reject) => {
        character.canvasImage.toBlob((blob) => {
          console.log(blob);
          const file = new File([blob], `${character.getName()}-preview.jpg`, { type: 'image/jpeg'});
          resolve(file);
        }, 'image/jpeg');
      });
      console.log('uploading char image');
      const uploadResult = await uploadBytes(storageRef, getFile);
      console.log('char image uploaded, getting download url');
      const downloadUrl = await getDownloadURL(storageRef);

      console.log('returning', downloadUrl);
      return downloadUrl;
    }

    gameboardForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const firebaseDb = getFirestore(app);
      const gameboardsCollection = collection(firebaseDb, 'gameboards');
      const newGameboardDoc = doc(gameboardsCollection);
      const newGameboardTitle = gameboardTitle.value;
      const newGameboardImageUrl = await getGameboardImageURL();
      const newGameboardCharacters = await Promise.all(characters.map(async (character) => {

        const imageUrl = await getCharacterImageURL(character);

        return {
          name: character.getName(),
          image: imageUrl
        }
      }));


      console.log(newGameboardCharacters);
      console.log('setting gameboard doc');
      setDoc(newGameboardDoc, {
        title: newGameboardTitle,
        image: newGameboardImageUrl,
        characters: newGameboardCharacters,
      }).then(() => {
        console.log('set gameboard doc');
      });


      // Write characters to their own documents in characters subcollection
      // This way you can retrieve coordinates later, one at a time when neccessary
      // Prevents cheating

      console.log('batch writing characters');

      const charactersBatch = writeBatch(firebaseDb);
      const charactersSubCollection = collection(newGameboardDoc, 'characters');

      characters.forEach((character) => {
        const newCharacter = doc(charactersSubCollection);
        const characterCoords = character.getCoordinates();

        console.log(newCharacter);
        charactersBatch.set(newCharacter, {
          name: character.getName(),
          coordinates: {
            x1: characterCoords.getPointOne().getX(),
            y1: characterCoords.getPointOne().getY(),
            x2: characterCoords.getPointTwo().getX(),
            y2: characterCoords.getPointTwo().getY(),
          }
        });
      });

      charactersBatch.commit()
        .then(() => {
          console.log('characters written');
        });
    });

    return gameboardForm;
  }
}

export default AdminTools;
