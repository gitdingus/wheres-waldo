import { getElementFromTemplateFile } from 'dom-utils';
import accessDenied from './template/no-access.template.html';
import addGameboardForm from './template/add-gameboard-form.template.html';

class AdminTools {
  static getAccessDenied() {
    return getElementFromTemplateFile(accessDenied);
  }

  static getAddGameboardForm() {
    return getElementFromTemplateFile(addGameboardForm);
  }
}

export default AdminTools;