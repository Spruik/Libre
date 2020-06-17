'use strict';

System.register([], function (_export, _context) {
  "use strict";

  var STATE_PLAN, STATE_READY, STATE_FLAG, STATE_START, STATE_PAUSE, STATE_COMPLETE, STATE_CLOSE;
  return {
    setters: [],
    execute: function () {
      _export('STATE_PLAN', STATE_PLAN = 'planned');

      _export('STATE_PLAN', STATE_PLAN);

      _export('STATE_READY', STATE_READY = 'ready');

      _export('STATE_READY', STATE_READY);

      _export('STATE_FLAG', STATE_FLAG = 'next');

      _export('STATE_FLAG', STATE_FLAG);

      _export('STATE_START', STATE_START = 'running');

      _export('STATE_START', STATE_START);

      _export('STATE_PAUSE', STATE_PAUSE = 'paused');

      _export('STATE_PAUSE', STATE_PAUSE);

      _export('STATE_COMPLETE', STATE_COMPLETE = 'complete');

      _export('STATE_COMPLETE', STATE_COMPLETE);

      _export('STATE_CLOSE', STATE_CLOSE = 'closed');

      _export('STATE_CLOSE', STATE_CLOSE);
    }
  };
});
//# sourceMappingURL=constants.js.map
