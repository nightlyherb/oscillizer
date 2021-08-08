import CellMap from '../../../engine/BaseTypes/CellMap.js';

/**
 * Given an oscillator, return the board of each phase of the oscillation. (t=0..p-1)
 * Given a non-oscillator, return `[]`.
 * @param {IBoard} board - The initial board
 * @param {number} maxGens - Maximum number of gens to detect oscillation.
 * @returns {Array<IBoard>} - All phases of the oscillator, or an empty array
 */
export const getPhases = (board, maxGens = 1000) => {
  /**
   * @param {Array} array
   * @param {Set} set
   * @returns {boolean}
   */
  const haveSameMembers = (array, set) => (
    array.length === set.size && array.every((cell) => set.has(cell))
  );

  /**
   * Helper function used in Array.reduce.
   *
   * @param {*} state - Current iteration state.
   * @property {Array<IBoard>} state.result - The final result.
   * @property {Array<IBoard>} state.lastBoards - The boards during calculation.
   * @property {CellMap} state.initialCellsSet
   * @returns {*} - Updated state, with the same type as state
   */
  const appendNextBoard = (state) => {
    const { result, lastBoards, initialCellsSet } = state;
    if (result.length !== 0) {
      return state;
    }
    const lastBoard = lastBoards[lastBoards.length - 1];
    const currBoard = lastBoard.after();
    if (haveSameMembers(currBoard.getCells(), initialCellsSet)) {
      return { result: lastBoards, lastBoards: [], initialCellsSet };
    }
    return {
      result: [],
      lastBoards: lastBoards.concat(currBoard),
      initialCellsSet,
    };
  };

  const repeatForMaxGens = new Array(maxGens).fill();
  const initialData = {
    result: [],
    lastBoards: [board],
    initialCellsSet: CellMap.fromKeys(board.getCells()),
  };
  const phases = repeatForMaxGens.reduce(appendNextBoard, initialData).result;
  return phases; // Return empty array on failure
};

/**
 * Given the phases of an oscillator, calculate and return the subperiod of each cell.
 * @param {Array<IBoard>} oscPhaseBoards - The phases of an oscillator
 * @returns {Array<{cell: Cell, subperiod: number}>} - Subperiods for every cell.
 */
export const getSubperiodByCell = (oscPhaseBoards) => {
  // Get the list of oscillator phases.
  // Return a list of `{ cell, aliveGens }` where `aliveGens` is the gens `cell` was alive.
  const getAliveGensByCell = (phases) => {
    const phasesSet = phases.map(CellMap.fromKeys);
    const allCells = CellMap.fromKeys([].concat(...phases)).keys();
    const gens = phases.map((_, gen) => gen);
    return allCells.map(
      (cell) => ({
        cell,
        aliveGens: gens.filter((gen) => phasesSet[gen].has(cell)),
      })
    );
  };

  // Get the list of gens a cell was alive.
  // Return the subperiod.
  const getSubperiodOfOneCell = (aliveGens, period) => {
    const aliveGensSet = new Set(aliveGens);
    const subperiods = new Array(period)
      .fill()
      .map((_, i) => i + 1)
      .filter((n) => period % n === 0);
    const isSubperiodValid = (n) => aliveGens
      .map((g) => (g + n) % period)
      .every((g) => aliveGensSet.has(g));
    const validSubperiods = subperiods.filter(isSubperiodValid);
    return Math.min(...validSubperiods);
  };

  const period = oscPhaseBoards.length;
  const result = getAliveGensByCell(oscPhaseBoards.map((b) => b.getCells()))
    .map(
      ({ cell, aliveGens }) => (
        {
          cell,
          subperiod: getSubperiodOfOneCell(aliveGens, period),
        }
      )
    );
  return result;
};
