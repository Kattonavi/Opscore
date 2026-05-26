package com.opscore.dto.incident;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncidentPriorityMetricsDTO {
    private long low;
    private long medium;
    private long high;
    private long critical;
    //private long emergency;
}
