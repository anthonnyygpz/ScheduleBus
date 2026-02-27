import { IGroup, IRoute } from "@/core/entities/types.type";

export class EmployeeResponseDto {
  public readonly id: number;
  public readonly name: string;
  public readonly email: string;
  public readonly phone: string;
  public readonly group: IGroup;
  public readonly routes: IRoute[];

  constructor(props: {
    id: number;
    name: string;
    email: string;
    phone: string;
    group: IGroup;
    routes: IRoute[];
  }) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
    this.group = props.group;
    this.routes = props.routes;
  }
}
