import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { labWorkflowService } from "@/services/lab-workflow.service";
import {
  LabOrdersFilterParams,
  LabResultsFilterParams,
  ReviewLabOrderRequest,
  SendLabOrderMessageRequest,
  UpdateLabOrderStatusRequest,
  UploadLabResultRequest,
} from "@/types/lab-workflow.types";

const normalizeListParams = <T extends Record<string, unknown>>(params?: T) =>
  Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string") return value.trim().length > 0;
      return true;
    }),
  ) as T;

export const labWorkflowQueryKeys = {
  all: ["lab-workflow"] as const,
  orders: (params?: LabOrdersFilterParams) =>
    ["lab-workflow", "orders", normalizeListParams(params)] as const,
  orderDetails: (orderId: string) =>
    ["lab-workflow", "orders", "detail", orderId] as const,
  results: (params?: LabResultsFilterParams) =>
    ["lab-workflow", "results", normalizeListParams(params)] as const,
};

export const useLabOrdersQuery = (params?: LabOrdersFilterParams, enabled = true) =>
  useQuery({
    queryKey: labWorkflowQueryKeys.orders(params),
    queryFn: () => labWorkflowService.getLabOrders(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useLabOrderDetailsQuery = (orderId: string | undefined, enabled = true) =>
  useQuery({
    queryKey: labWorkflowQueryKeys.orderDetails(orderId ?? ""),
    queryFn: () => labWorkflowService.getLabOrderById(orderId ?? ""),
    enabled: enabled && Boolean(orderId),
  });

export const useUpdateLabOrderStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: UpdateLabOrderStatusRequest;
    }) => labWorkflowService.updateLabOrderStatus(orderId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: labWorkflowQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: labWorkflowQueryKeys.orderDetails(variables.orderId),
      });
    },
  });
};

export const useReviewLabOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: ReviewLabOrderRequest;
    }) => labWorkflowService.reviewLabOrder(orderId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: labWorkflowQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: labWorkflowQueryKeys.orderDetails(variables.orderId),
      });
    },
  });
};

export const useLabOrderMessageMutation = (requestId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendLabOrderMessageRequest) =>
      labWorkflowService.sendLabOrderMessage(requestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labWorkflowQueryKeys.orders() });
      queryClient.invalidateQueries({ queryKey: ["lab-workflow", "orders", "detail"] });
    },
  });
};

export const useUploadLabOrderResultMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: UploadLabResultRequest;
    }) => labWorkflowService.uploadLabOrderResult(orderId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: labWorkflowQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["lab-workflow", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["lab-workflow", "results"] });
      queryClient.invalidateQueries({
        queryKey: labWorkflowQueryKeys.orderDetails(variables.orderId),
      });
    },
  });
};

export const useLabResultsQuery = (params?: LabResultsFilterParams, enabled = true) =>
  useQuery({
    queryKey: labWorkflowQueryKeys.results(params),
    queryFn: () => labWorkflowService.getLabResults(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });
