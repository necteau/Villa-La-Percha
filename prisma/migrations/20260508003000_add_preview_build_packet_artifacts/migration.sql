-- Add DirectStay Preview Build packet artifact types.
alter type "PlatformLeadArtifactType" add value if not exists 'PREVIEW_PHOTO_GEO_AUDIT';
alter type "PlatformLeadArtifactType" add value if not exists 'PREVIEW_DESIGN_BRIEF';
alter type "PlatformLeadArtifactType" add value if not exists 'PREVIEW_FACT_REGISTER';
alter type "PlatformLeadArtifactType" add value if not exists 'PREVIEW_ASSUMPTION_REGISTER';
alter type "PlatformLeadArtifactType" add value if not exists 'PREVIEW_RUBRIC_REVIEW';
alter type "PlatformLeadArtifactType" add value if not exists 'PREVIEW_SHARE_NOTE';
alter type "PlatformLeadArtifactType" add value if not exists 'PREVIEW_CONVERSION_PACKET';
