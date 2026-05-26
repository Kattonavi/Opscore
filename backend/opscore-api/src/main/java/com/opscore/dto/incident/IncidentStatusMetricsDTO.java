package com.opscore.dto.incident;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncidentStatusMetricsDTO {
    private long total;
    private long open;
    private long assigned;
    private long inProgress;
    private long onHold;
    private long resolved;
    private long closed;
    private long canceled;
}