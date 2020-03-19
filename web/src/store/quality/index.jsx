import { combineReducers } from 'redux';
import * as plan from './plan';

const actions = {
  ...plan.actions,
};

const reducer = combineReducers({
  plan: plan.reducer,
});

const effects = {
  ...plan.effects,
};

export { actions, reducer, effects };
