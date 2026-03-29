package entity

// SyncResult represents the result of a sync operation
type SyncResult struct {
	Uploaded []string `json:"uploaded"`
	Skipped  []string `json:"skipped"`
	Failed   []string `json:"failed"`
}

// AddUploaded adds a file to the uploaded list
func (r *SyncResult) AddUploaded(file string) {
	r.Uploaded = append(r.Uploaded, file)
}

// AddSkipped adds a file to the skipped list
func (r *SyncResult) AddSkipped(file string) {
	r.Skipped = append(r.Skipped, file)
}

// AddFailed adds a file to the failed list
func (r *SyncResult) AddFailed(file string) {
	r.Failed = append(r.Failed, file)
}

// Total returns the total number of processed files
func (r *SyncResult) Total() int {
	return len(r.Uploaded) + len(r.Skipped) + len(r.Failed)
}

// HasErrors returns true if there were any failures
func (r *SyncResult) HasErrors() bool {
	return len(r.Failed) > 0
}
