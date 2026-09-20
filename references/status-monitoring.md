# Local task status

Run `python3 scripts/task_status.py --task-id TASK_ID --state-file /absolute/project/api-jobs/PART_ID.json`. This reads one local record and returns compact JSON without network or generation calls. --watch checks for meaningful changes; the defaults are a 15-second interval and a 3600-second timeout. --until-downloaded waits for local_model after remote completion. A download is not visual acceptance.

Records need task_uuid and status. Download-aware adapters also use local_model and execution_phase values remote_processing/downloading/downloaded/failed/paused/needs_attention. A legacy local_file field must be adapted before claiming download-aware support. Missing, malformed or mismatched IDs fail explicitly. Active records unchanged for 120 seconds are stale by default, not proven remote failures or process exits.

Outputs omit keys, signed URLs, prompts and encoded assets. Prefer executor process completion before reading a summary, then continue artifact verification. Do not repeatedly wake the model for unchanged states or end work only to reduce token use. Create a separate status task only if the user requests it; include only the ID, state path and command, not the entire original conversation. A smaller tool response does not prove that a host removed earlier context.
