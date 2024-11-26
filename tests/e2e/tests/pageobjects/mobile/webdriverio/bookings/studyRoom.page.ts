import data from '../../../../strings/index';
import Driver from '../driver';

class StudyRoom extends Driver {
  async findAvailableRoom(index: number) {
    const available: string = data.bookingScreen.bookingStatus.available;

    const bookingRooms = await $$(
      `android=new UiSelector().descriptionContains("${available}")`,
    );
    const selectedBookingRoom = await bookingRooms[index];
    return selectedBookingRoom;
  }
  async moveToNextWeek() {
    const rightArrowBtn = await this.findByUiSelector(
      `new UiSelector().description("Mostra password").instance(1)`,
    );
    await rightArrowBtn.click();
  }
}

export default new StudyRoom();
