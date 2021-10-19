import { JwtFsm } from '.';

describe('JWT-FSM', () => {
  const renewMock = jest.fn();
  const recoverMock = jest.fn();

  const jwtFsm = new JwtFsm({
    renew: renewMock,
    recover: recoverMock,
  });

  test('recover is called upon instantiation', () => {
    expect(recoverMock).toBeCalled();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });
});
