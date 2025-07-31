import { __nullable__ } from '@onlyjs/db/prismabox/__nullable__';
import { CityPlain } from '@onlyjs/db/prismabox/City';
import { CountryPlain } from '@onlyjs/db/prismabox/Country';
import { RegionPlain } from '@onlyjs/db/prismabox/Region';
import { StatePlain } from '@onlyjs/db/prismabox/State';
import { SubregionPlain } from '@onlyjs/db/prismabox/Subregion';
import { t } from 'elysia';
import {
  type ControllerHook,
  errorResponseDto,
  paginationQueryDto,
  paginationResponseDto,
} from '#utils';

export const countryResponseDto = t.Composite([
  t.Omit(CountryPlain, ['regionId', 'subregionId', 'latitude', 'longitude']),
  t.Object({
    latitude: __nullable__(t.String()),
    longitude: __nullable__(t.String()),
  }),
]);
export const stateResponseDto = t.Composite([
  t.Omit(StatePlain, ['countryId', 'latitude', 'longitude']),
  t.Object({
    latitude: __nullable__(t.String()),
    longitude: __nullable__(t.String()),
  }),
]);
export const cityResponseDto = t.Composite([
  t.Omit(CityPlain, ['countryId', 'stateId', 'latitude', 'longitude']),
  t.Object({
    latitude: __nullable__(t.String()),
    longitude: __nullable__(t.String()),
  }),
]);
export const regionResponseDto = RegionPlain;
export const subregionResponseDto = SubregionPlain;

//Country DTOS
export const countryIndexDto = {
  query: t.Object({
    ...paginationQueryDto.properties,
    search: t.Optional(t.String()),
  }),
  response: {
    200: paginationResponseDto(countryResponseDto),
  },
  detail: {
    summary: 'Index',
    description: 'Returns list of countries',
  },
} satisfies ControllerHook;

export const countryShowDto = {
  params: t.Object({
    id: t.Number(),
  }),
  response: { 200: countryResponseDto, 404: errorResponseDto[404] },
  detail: {
    summary: 'Show',
    description: 'Returns country details',
  },
} satisfies ControllerHook;

// State DTOs
export const stateIndexDto = {
  query: t.Object({
    ...paginationQueryDto.properties,
    search: t.Optional(t.String()),
    countryId: t.Optional(t.Number()),
  }),
  response: {
    200: paginationResponseDto(stateResponseDto),
  },
  detail: {
    summary: 'Index',
    description: 'Returns list of states',
  },
} satisfies ControllerHook;

export const stateShowDto = {
  params: t.Object({
    id: t.Number(),
  }),
  response: { 200: stateResponseDto, 404: errorResponseDto[404] },
  detail: {
    summary: 'Show',
    description: 'Returns state details',
  },
} satisfies ControllerHook;

// City DTOs
export const cityIndexDto = {
  query: t.Object({
    ...paginationQueryDto.properties,
    search: t.Optional(t.String()),
    countryId: t.Optional(t.Number()),
    stateId: t.Optional(t.Number()),
  }),
  response: {
    200: paginationResponseDto(cityResponseDto),
  },
  detail: {
    summary: 'Index',
    description: 'Returns list of cities',
  },
} satisfies ControllerHook;

export const cityShowDto = {
  params: t.Object({
    id: t.Number(),
  }),
  response: { 200: cityResponseDto, 404: errorResponseDto[404] },
  detail: {
    summary: 'Show',
    description: 'Returns city details',
  },
} satisfies ControllerHook;

// Region DTOs
export const regionIndexDto = {
  query: t.Object({
    ...paginationQueryDto.properties,
    search: t.Optional(t.String()),
  }),
  response: {
    200: paginationResponseDto(regionResponseDto),
  },
  detail: {
    summary: 'Index',
    description: 'Returns list of regions',
  },
} satisfies ControllerHook;

export const regionShowDto = {
  params: t.Object({
    id: t.Number(),
  }),
  response: { 200: regionResponseDto, 404: errorResponseDto[404] },
  detail: {
    summary: 'Show',
    description: 'Returns region details',
  },
} satisfies ControllerHook;

// Subregion DTOs
export const subregionIndexDto = {
  query: t.Object({
    ...paginationQueryDto.properties,
    search: t.Optional(t.String()),
    regionId: t.Optional(t.Number()),
  }),
  response: {
    200: paginationResponseDto(subregionResponseDto),
  },
  detail: {
    summary: 'Index',
    description: 'Returns list of subregions',
  },
} satisfies ControllerHook;

export const subregionShowDto = {
  params: t.Object({
    id: t.Number(),
  }),
  response: { 200: subregionResponseDto, 404: errorResponseDto[404] },
  detail: {
    summary: 'Show',
    description: 'Returns subregion details',
  },
} satisfies ControllerHook;
