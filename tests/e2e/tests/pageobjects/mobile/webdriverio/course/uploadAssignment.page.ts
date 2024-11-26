import { setup } from '../../../../../config/setup';
import { timeoutTest } from '../../../../helpers/date';
import data from '../../../../strings/index';
import Driver from '../driver';

class UploadAssignmentPage extends Driver {
  async selectPickFileOption() {
    const pickFile: string = data.courseAssignmentUploadScreen.ctaUploadFile;

    const pickFileBtn = await this.findByUiSelectorText(pickFile);
    await pickFileBtn.click();
  }
  async selectScanDocumentOption() {
    const scandDocument: string =
      data.courseAssignmentUploadScreen.ctaCreatePDF;
    const scanDocumentBtn = await this.findByUiSelectorText(scandDocument);
    await scanDocumentBtn.click();
  }

  async pickFile(assignment: string) {
    const assignmentFile = await this.findByUiSelectorText(assignment);
    await assignmentFile.click();
  }
  async scanDocument() {
    const properties: Record<
      string,
      { shutter: string; done: string; crop: string; createPdf: string }
    > = {
      it: {
        shutter: 'Otturatore',
        done: 'Fine',
        crop: 'Taglia',
        createPdf: 'Crea PDF',
      },
      en: {
        shutter: 'Shutter',
        done: 'Done',
        crop: 'Crop',
        createPdf: 'Create PDF',
      },
    };
    const props = properties[setup.language];

    await driver.pause(timeoutTest);
    const shutterElement = await this.findByAccessibilityId(props.shutter);
    await shutterElement.click();

    const doneElement = await this.findByAccessibilityId(props.done);
    await doneElement.click();

    const cropElement = await this.findByAccessibilityId(props.crop);
    await cropElement.click();

    const createPdfElement = await this.findByAccessibilityId(props.createPdf);
    await createPdfElement.click();
  }

  async writeDescription(description: string) {
    const descAssignment =
      data.courseAssignmentUploadConfirmationScreen.descriptionLabel;
    const descAssignmentElement = await this.findByUiSelectorText(
      descAssignment,
    );
    await descAssignmentElement.setValue(description);
  }
  async uploadAssignment() {
    const upload = data.courseAssignmentUploadConfirmationScreen.ctaUpload;
    const sendBtn = await this.findByAccessibilityId(upload);
    await sendBtn.click();
  }
}

export default new UploadAssignmentPage();
