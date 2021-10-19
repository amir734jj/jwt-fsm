import moment from "moment";

import { JwtFsm } from ".";
import * as utility from "./utility";

jest.mock("./utility");
const mockedUtility = utility as jest.Mocked<typeof utility>;

describe("JWT-FSM", () => {
  const renewMock = jest.fn().mockReturnValue("renewedToken");
  const recoverMock = jest.fn().mockReturnValue("token");

  beforeAll(() => {
    // jest.useFakeTimers();
  });

  let jwtFsm: JwtFsm;

  test("recover is called upon instantiation", async () => {
    mockedUtility.validate.mockReturnValue(true);
    mockedUtility.tokenExpiresAt.mockReturnValue(
      moment().add(1, "day").toDate()
    );

    jwtFsm = new JwtFsm({
      renew: renewMock,
      recover: recoverMock,
    });

    await new Promise((r) => setTimeout(r, 100));
    jest.runAllTimers();

    expect(recoverMock).toBeCalled();
    expect(renewMock).not.toBeCalled();
  });

  test("renew is called upon renewal of expired token", async () => {
    mockedUtility.validate.mockReturnValue(true);
    mockedUtility.tokenExpiresAt.mockReturnValue(
      moment().add(1, "minute").toDate()
    );

    jwtFsm = new JwtFsm({
      renew: renewMock,
      recover: recoverMock,
    });

    await new Promise((r) => setTimeout(r, 100));
    jest.runAllTimers();

    expect(recoverMock).toBeCalled();
    expect(renewMock).toBeCalled();

    jest.runAllTimers();
  });

  afterEach(() => {
    jest.runAllTimers();
  });
});
