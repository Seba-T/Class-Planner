window.state = {
  _previousStates: [],
  _currentView: {
    _date: new Date(),
    _viewOption: "Month",
    get date() {
      return this._date;
    },
    set date(date) {
      this._date = date;
      const displayedDate = document.querySelector("#date");
      displayedDate.innerHTML = formatDisplayedDate(
        this._viewOption,
        this._date
      );
    },
    get viewOption() {
      return this._viewOption;
    },
    set viewOption(viewOption) {
      this._viewOption = viewOption;
      const viewButton = document.querySelector(" .currentViewOption");
      viewButton.innerHTML = this._viewOption;
    },
  },
  set currentView(newView) {
    // everytime the view is invoked
    this._currentView.viewOption = newView.viewOption;
    this._currentView.date = newView.date;
    displayCalendarGrid(
      this._currentView._viewOption,
      this._currentView._date
    ).then(() => {
      postCurrentView(this._currentView._viewOption, this._currentView._date);
    });
  },
  get currentView() {
    return this._currentView;
  },
  updateView: function (newView) {
    // console.log(newView);
    const currentViewOption = this.currentView.viewOption;
    const currentDate = this.currentView.date;
    let date = new Date(currentDate.getTime());

    this._previousStates.push({
      ...newView,
      ...{ currentViewOption, currentDate },
    });

    const viewOption =
      newView.viewOption !== 0 ? newView.viewOption : currentViewOption;
    const options = {
      Day: {
        direction: function (date, sign) {
          addDays(date, 1 * sign);
          if (date.getDay() === 0) addDays(date, 1 * sign);
        },
        viewChange: function (date) {
          getFirstDayOfWeek(date);
        },
        elmClick: function (cellNum) {
          if (this.currentView.viewOption === "Week") {
          }
        },
      },
      Week: {
        direction: function (date, sign) {
          addDays(date, 7 * sign);
        },
        viewChange: function (date) {
          getFirstDayOfWeek(date);
        },
      },
      Month: {
        direction: function (date, sign) {
          date.setMonth(date.getMonth() + 1 * sign);
        },
        viewChange: function (date) {
          addDays(date, 6);
          getFirstDayOfMonth(date);
        },
      },
      Year: {
        direction: function (date, sign) {
          date.setMonth(date.getMonth() + 3 * sign);
        }, //// requires attentions
        viewChange: function (date) {
          date.setMonth(0);
        },
      },
    };
    if (newView.direction !== 0 && newView.date === 0) {
      // only "direction" contains a value that's not 0
      // left or right
      const sign = newView.direction === "right" ? 1 : -1;
      options[viewOption].direction(date, sign);
      console.log(date);
    } else if (newView.date === 0) {
      // only viewOption contains a value  that's not 0
      // change of view (like day, month, etc)
      options[viewOption].viewChange(date);
      console.log(date);
    } else if (newView.date !== 0 ) {
      date = new Date(newView.date);
      
    }

    this.currentView = {
      viewOption,
      date,
    };
  },
};

window.serverRequestHandler = {
  canUpdateState: true,
  calledWhileOnTimeout: false,
  lastParams: [],
  callBackFunction: function () {
    this.canUpdateState = false;
    waitFunction(3000).then(() => {
      this.canUpdateState = true;
      if (this.calledWhileOnTimeout) {
        postCurrentView(...this.lastParams);
        this.calledWhileOnTimeout = false;
      }
    });
  },
};

function functionFireHandler(fn, parms) {
  if (parms.callBack) {
    let prevParams = { fn: 0, execFn: () => fn() };
  }
  let prevCall = "SOLVED";
  console.log(prevCall);
  return function (...args) {
    if (prevCall === "SOLVED") {
      prevCall = waitFunction(parms.timeLimit).then(() => {
        if (parms.callBack) prevParams.execFn();
        return "SOLVED";
      });
      return fn.call(this, args);
    } else {
      if (!parms.onTimeOutAwait) return fn.call(this, args);
      if (parms.callBack) {
        prevParams.fn = () => fn.call(this, args);
      }
    }
  };
}

// export const state = {
//   // metti le variabili qui
// }

// // dall'altra parte
// import { state } from "./state"
// state.currentDisplayedDate = qualcosa;

// let settings = JSON.parse(settings);

// let lan = settings.language;
