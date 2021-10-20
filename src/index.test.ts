import moment from 'moment';

import { JwtFsm } from '.';
import * as utility from './utility';

jest.mock('./utility');
const mockedUtility = utility as jest.Mocked<typeof utility>;

describe('JWT-FSM', () => {
  const renewMock = jest.fn().mockReturnValue('renewedToken');
  const recoverMock = jest.fn().mockReturnValue('token');
  const persistMock = jest.fn();

  let jwtFsm: JwtFsm;

  const options = {
    renew: renewMock,
    recover: recoverMock,
    persist: persistMock,
    logger: { info: (_: string) => {}, error: (_: string) => {} },
  };

  const sleep = (): Promise<void> => new Promise((r) => setTimeout(r, 100));

  test('recover is called upon instantiation', async () => {
    mockedUtility.validate.mockReturnValue(true);
    mockedUtility.tokenExpiresAt.mockReturnValue(
      moment().add(1, 'day').toDate(),
    );

    jwtFsm = new JwtFsm(options);
    await sleep();

    expect(recoverMock).toBeCalled();
    expect(renewMock).not.toBeCalled();
  });

  test('renew is called upon renewal of expired token', async () => {
    mockedUtility.validate.mockReturnValue(true);
    mockedUtility.tokenExpiresAt
      .mockReturnValueOnce(moment().add(1, 'minute').toDate())
      .mockReturnValueOnce(moment().add(100, 'minute').toDate());

    jwtFsm = new JwtFsm(options);

    await sleep();

    expect(recoverMock).toBeCalled();
    expect(renewMock).toBeCalled();
    expect(persistMock).toBeCalledWith('renewedToken');
  });

  test('persist is called upon setToken', async () => {
    mockedUtility.validate.mockReturnValue(true);
    mockedUtility.tokenExpiresAt
      .mockReturnValueOnce(moment().add(1, 'minute').toDate())
      .mockReturnValueOnce(moment().add(100, 'minute').toDate());

    jwtFsm = new JwtFsm(options);

    await jwtFsm.setToken('newToken');

    expect(persistMock).toHaveBeenCalledWith('newToken');
  });

  afterEach(() => {
    jwtFsm.dispose();
  });

  afterAll((done) => {
    jest.clearAllTimers();
    done();
  });
});
