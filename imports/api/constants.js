/* old mongo way
export const flagsHash = {
  0: {
    val: 0,
    description: 'zero',
    label: 'Q',
    selectable: true,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-zero'
  },
  1: {
    val: 1,
    description: 'valid',
    label: 'K',
    selectable: true,
    color: '#BF0B23',
    color10: 'transparent',
    labelcolor: 'label-danger'
  },
  2: {
    val: 2,
    description: 'span',
    label: 'Q',
    selectable: true,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning'
  },
  3: {
    val: 3,
    description: 'span',
    label: 'Q',
    selectable: false,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning'
  },
  4: {
    val: 4,
    description: 'span',
    label: 'Q',
    selectable: false,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning'
  },
  5: {
    val: 5,
    description: 'span',
    label: 'Q',
    selectable: false,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning'
  },
  6: {
    val: 6,
    description: 'span',
    label: 'Q',
    selectable: false,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning'
  },
  7: {
    val: 7,
    description: 'span',
    label: 'Q',
    selectable: false,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning'
  },
  8: {
    val: 8,
    description: 'maintenance',
    label: 'P',
    selectable: true,
    color: 'grey',
    color10: 'darkgrey',
    labelcolor: 'label-info'
  },
  9: {
    val: 9,
    description: 'offline',
    label: 'N',
    selectable: true,
    color: 'black',
    color10: 'black',
    labelcolor: 'label-default'
  }
};

export const channelHash = {
  RMY_WS: 1,
  RMY_WD: 2,
  TRH_Temp: 6,
  HMP60_Temp: 6,
  TRH_RH: 38,
  HMP60_RH: 38,
  O3_O3conc: 25,
  TEOM_MassConc: 43,
  TEOM_AmbTemp: 70,
  NOx_NOconc: 28,
  NOy_NOyconc: 34,
  NOx_NO2conc: 29,
  NOx_NOxconc: 30,
  NOy_NOyConc: 34,
  NO_NOConc: 28,
  NO2_NO2Conc: 29,
  NOx_NO2Conc: 29,
  Rain_Precip: 8,
  Baro_Press: 9,
  CO_COconc: 27,
  SO_SO2conc: 26,
  SO2_SO2conc: 26,
  SO2_SO2Conc: 26
};

export const unitsHash = {
  O3: 'pbbv',
  Conc: 'pbbv',
  conc: 'pbbv',
  NO: 'pbbv',
  NO2: 'pbbv',
  NOx: 'pbbv',
  WS: 'meter/second',
  WD: 'degree',
  Temp: 'degree C',
  TEMP: 'degree C',
  RH: 'percent',
  MassConc: 'ugm3',
  AmbTemp: 'C'
};

export const importOldJobJobStatus = {
	percent: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100],
	done: 'done',
	pending: 'pending'
}
*/

const flagsHash = {
  0: {
    val: 0,
    description: 'zero',
    label: 'Q',
    selectable: true,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-zero'
  },
  1: {
    val: 1,
    description: 'valid',
    label: 'K',
    selectable: true,
    color: '#BF0B23',
    color10: 'transparent',
    labelcolor: 'label-danger'
  },
  2: {
    val: 2,
    description: 'span',
    label: 'Q',
    selectable: true,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning'
  },
  3: {
    val: 3,
    description: 'span',
    label: 'Q',
    selectable: false,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning'
  },
  4: {
    val: 4,
    description: 'span',
    label: 'Q',
    selectable: false,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning'
  },
  5: {
    val: 5,
    description: 'span',
    label: 'Q',
    selectable: false,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning'
  },
  6: {
    val: 6,
    description: 'span',
    label: 'Q',
    selectable: false,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning'
  },
  7: {
    val: 7,
    description: 'span',
    label: 'Q',
    selectable: false,
    color: 'orange',
    color10: 'green',
    labelcolor: 'label-warning'
  },
  8: {
    val: 8,
    description: 'maintenance',
    label: 'P',
    selectable: true,
    color: 'grey',
    color10: 'darkgrey',
    labelcolor: 'label-info'
  },
  9: {
    val: 9,
    description: 'offline',
    label: 'N',
    selectable: true,
    color: 'black',
    color10: 'black',
    labelcolor: 'label-default'
  }
};

const channelHash = {
  RMY_WS: 1,
  RMY_WD: 2,
  TRH_Temp: 6,
  HMP60_Temp: 6,
  TRH_RH: 38,
  HMP60_RH: 38,
  O3_O3conc: 25,
  TEOM_MassConc: 43,
  TEOM_AmbTemp: 70,
  NOx_NOconc: 28,
  NOy_NOyconc: 34,
  NOx_NO2conc: 29,
  NOx_NOxconc: 30,
  NOy_NOyConc: 34,
  NO_NOConc: 28,
  NO2_NO2Conc: 29,
  NOx_NO2Conc: 29,
  Rain_Precip: 8,
  Baro_Press: 9,
  CO_COconc: 27,
  SO_SO2conc: 26,
  SO2_SO2conc: 26,
  SO2_SO2Conc: 26
};

const unitsHash = {
  O3: 'pbbv',
  Conc: 'pbbv',
  conc: 'pbbv',
  NO: 'pbbv',
  NO2: 'pbbv',
  NOx: 'pbbv',
  WS: 'meter/second',
  WD: 'degree',
  Temp: 'degree C',
  TEMP: 'degree C',
  RH: 'percent',
  MassConc: 'ugm3',
  AmbTemp: 'C'
};

// Want to use constants to decrease the chance for user error
const importOldJobStatus = {
	done: 'done',
	pending: 'pending',
	running: 'running'
}

module.exports = { flagsHash, channelHash, unitsHash, importOldJobStatus };
