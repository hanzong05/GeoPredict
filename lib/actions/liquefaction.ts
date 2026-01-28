// lib/actions/liquefaction.ts
'use server'

const PYTHON_API_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';


export interface PredictionInput {
    latitude: number;
    longitude: number;
    spt_n60?: number;
    unit_weight?: number;
    csr?: number;
    crr?: number;
    gwl?: number;
    fines_percent?: number;
}

export interface PredictionResult {
    location: {
        latitude: number;
        longitude: number;
        nearest_borehole_distance_km: number;
    };
    risk_assessment: {
        risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
        probability: number;  // 0-100
        severity: string;     // "Minor" | "Moderate" | "Severe"
    };
    soil_parameters: {
        spt_n60: number;
        unit_weight: number;
        csr: number;
        crr: number;
        gwl: number;
        fines_percent: number;
        source: string;
    };
    settlement: {
        predicted_cm: number;
        severity: string;  // "Minor" | "Moderate" | "Severe"
    };
    bearing_capacity: {
        pre_liquefaction_kpa: number;
        post_liquefaction_kpa: number;
        capacity_reduction_percent: number;
    };
    recommendations: string[];
}

export interface NearestBoreholeResult {
    success: boolean;
    nearest_borehole: {
        id: number;
        borehole_id: string;
        distance_km: number;
        latitude: number;
        longitude: number;
    };
    soil_parameters: {
        spt_n60: number;
        unit_weight: number;
        csr: number;
        crr: number;
        gwl: number;
        fines_percent: number;
    };
}


export async function predictByLocation(latitude: number, longitude: number) {
    try {
        const response = await fetch(
            `${PYTHON_API_URL}/predict-by-location?latitude=${latitude}&longitude=${longitude}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Prediction failed');
        }

        const data: PredictionResult = await response.json();
        return { success: true, data };

    } catch (error) {
        console.error('Prediction error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Prediction failed'
        };
    }
}


export async function predictLiquefaction(input: PredictionInput) {
    try {
        const response = await fetch(`${PYTHON_API_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
            cache: 'no-store',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Prediction failed');
        }

        const data: PredictionResult = await response.json();
        return { success: true, data };

    } catch (error) {
        console.error('Prediction error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Prediction failed'
        };
    }
}


export async function getNearestBorehole(latitude: number, longitude: number) {
    try {
        const response = await fetch(
            `${PYTHON_API_URL}/nearest-borehole?latitude=${latitude}&longitude=${longitude}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to fetch borehole data');
        }

        const data: NearestBoreholeResult = await response.json();
        return { success: true, data };

    } catch (error) {
        console.error('Borehole fetch error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch borehole data'
        };
    }
}


export async function checkBackendHealth() {
    try {
        const response = await fetch(`${PYTHON_API_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Backend unhealthy');
        }

        const data = await response.json();
        return { success: true, data };

    } catch (error) {
        console.error('Health check error:', error);
        return { success: false, error: 'Backend service unavailable' };
    }
}


export interface PipelineStatus {
    is_running: boolean;
    current_step: string | null;
    progress: number;
    start_time: string | null;
    end_time: string | null;
    steps_completed: string[];
    error: string | null;
    total_logs: number;
}

export async function startTrainingPipeline() {
    try {
        const response = await fetch(`${PYTHON_API_URL}/pipeline/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to start pipeline');
        }

        const data = await response.json();
        return { success: true, data };

    } catch (error) {
        console.error('Pipeline start error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to start pipeline'
        };
    }
}

export async function getTrainingPipelineStatus() {
    try {
        const response = await fetch(`${PYTHON_API_URL}/pipeline/status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error('Failed to get pipeline status');
        }

        const data: PipelineStatus = await response.json();
        return { success: true, data };

    } catch (error) {
        console.error('Pipeline status error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get status'
        };
    }
}

export async function getTrainingPipelineLogs(limit: number = 50) {
    try {
        const response = await fetch(`${PYTHON_API_URL}/pipeline/logs?limit=${limit}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error('Failed to get pipeline logs');
        }

        const data = await response.json();
        return { success: true, data };

    } catch (error) {
        console.error('Pipeline logs error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get logs'
        };
    }
}