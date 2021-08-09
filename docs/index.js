import AppState from './MVC/Models/AppState.js';
import EventTargetPassingController from './MVC/Controllers/PassingController/EventTargetPassingController.js';
import OscStatsController from './MVC/Controllers/OscStatsController/OscStatsController.js';
import OscillizerCanvasView from './MVC/Views/updateoscillizercanvas.js';
import makeUpdateOscillizerStatistics from './MVC/Views/updateoscillizerstatistics.js';

const appState = {
  oscInfo: new AppState(),

  /*
    Cell style for cells at gen 0
    this.value: cellStyles.property
  */
  initialCellStyle: new AppState(),
};

// @ts-ignore
if (window.Cypress) {
  // @ts-ignore
  window.appState = appState;
}

/* Action -> State update code */

const inputRleSubmitter = document.getElementById('input-rle-submitter');
const cellStyleSelector = document.getElementById('cell-style-selector');
const inputRleContainer = document.getElementById('input-rle-container');

const oscController = new OscStatsController(appState.oscInfo, inputRleContainer);
const cellStyleController = new EventTargetPassingController(appState.initialCellStyle);

inputRleSubmitter.addEventListener('click', oscController.update);
cellStyleSelector.addEventListener('change', cellStyleController.update);

/* State -> UI update code */

const oscCanvas = document.getElementById('output-osc-canvas');
const oscCanvasView = new OscillizerCanvasView(
  appState.oscInfo, appState.initialCellStyle, oscCanvas
);
appState.oscInfo.eventTarget.addEventListener('change', oscCanvasView.update);

const oscStatsElement = document.getElementById('output-osc-data');
const updateStats = makeUpdateOscillizerStatistics(appState.oscInfo, oscStatsElement);
appState.oscInfo.eventTarget.addEventListener('change', updateStats);
