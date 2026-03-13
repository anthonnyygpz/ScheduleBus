import { IGroup, IRoute } from "./types.type";

export class Employee {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    public phone: string,
    public group: IGroup,
    public routes: IRoute[],
    public status: string,
  ) {}
}
