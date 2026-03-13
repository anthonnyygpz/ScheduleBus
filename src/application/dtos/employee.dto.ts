import { IGroup, IRoute } from "@/core/entities/types.type";
import { Metadata } from "./pagination.dto";

export class EmployeeResponseDto {
  constructor(props: EmployeeResponseDto) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
    this.group = props.group;
    this.routes = props.routes;
  }

  public readonly id: number;
  public readonly name: string;
  public readonly email: string;
  public readonly phone: string;
  public readonly group: IGroup;
  public readonly routes: IRoute[];
}

export class EmployeeRequestDto {
  constructor(props: EmployeeRequestDto) {
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
    this.groupId = props.groupId;
    this.routeIds = props.routeIds;
    this.status = props.status;
  }

  public readonly name: string;
  public readonly email: string;
  public readonly phone: string;
  public readonly groupId: string;
  public readonly routeIds: string[];
  public readonly status: string;
}

export interface EmployeeFiltersDto {
  search?: string;
  limit?: number;
  page?: number;
  status?: string;
  orderBy?: string;
  ascending?: boolean;
  groupId?: number;
}

export class PaginatedEmployeeResponseDto {
  constructor(props: PaginatedEmployeeResponseDto) {
    this.metadata = props.metadata;
    this.data = props.data;
  }

  public readonly metadata: Metadata;
  public readonly data: EmployeeResponseDto[];
}
